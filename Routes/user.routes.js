
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../Models/register.model');
const jwt = require('jsonwebtoken');

// Welcome page
router.get('/', (req, res) => {
    res.render('welcome.ejs');
});

// Login page
router.get('/login', (req, res) => {
    res.render('login.ejs');
});

// Register page
router.get('/register', (req, res) => {
    res.render('register.ejs');
});

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.redirect('/login');
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { emailid, Password } = req.body;

        if (!emailid || !Password) {
            return res.status(400).send('Email and password are required.');
        }

        const user = await User.findOne({ emailid });

        if (!user) {
            return res.send(`
                <script>
                    alert("You are not a user. Please register.");
                    window.location.href = "/register";
                </script>
            `);
        }

        const isMatch = await bcrypt.compare(Password, user.Password);

        console.log("Password matched:", isMatch);

        if (!isMatch) {
            return res.send(`
                <script>
                    alert("Incorrect password. Please try again.");
                    window.location.href = "/login";
                </script>
            `);
        }

        const token = jwt.sign(
            { registerId: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.redirect('/dashboard');

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).send('Login failed. Please try again.');
    }
});

// Register
router.post('/register', async (req, res) => {
    try {
        const { fullname, emailid, Password } = req.body;

        if (!fullname || !emailid || !Password) {
            return res.status(400).send('All fields are required.');
        }

        const existingUser = await User.findOne({
            $or: [{ fullname }, { emailid }]
        });

        if (existingUser) {
            return res.send(`
                <script>
                    alert("Name or email already exists.");
                    window.location.href = "/register";
                </script>
            `);
        }

        const hashedPassword = await bcrypt.hash(Password, 10);

        const register = new User({
            fullname,
            emailid,
            Password: hashedPassword
        });

        await register.save();

        return res.send(`
            <script>
                alert("Registration is successful! Please login.");
                window.location.href = "/login";
            </script>
        `);

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).send('Registration failed. Please try again.');
    }
    
    
});
// Forgot Password Page
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
});

// Check Registered Email
router.post('/forgot-password', async (req, res) => {
    try {
        const emailid = req.body.emailid?.trim();

        if (!emailid) {
            return res.status(400).send('Please enter your email.');
        }

        const user = await User.findOne({
            emailid: new RegExp(
                '^' + emailid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$',
                'i'
            )
        });

        if (!user) {
            return res.status(404).send(`
                <script>
                    alert("This email is not registered. Please register first.");
                    window.location.href = "/forgot-password";
                </script>
            `);
        }

        res.render('reset-password', {
            emailid: user.emailid
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong.');
    }
});

// Update Password
router.post('/reset-password', async (req, res) => {
    try {
        const { emailid, Password, confirmPassword } = req.body;

        if (!Password || Password.length < 8) {
            return res.status(400).send(
                'Password must be at least 8 characters.'
            );
        }

        if (Password !== confirmPassword) {
            return res.status(400).send(
                'Passwords do not match.'
            );
        }

        const user = await User.findOne({ emailid });

        if (!user) {
            return res.status(404).send(
                'Registered user not found.'
            );
        }

        user.Password = await bcrypt.hash(Password, 10);
        await user.save();

        res.send(`
            <script>
                alert("Password updated successfully. Please login.");
                window.location.href = "/login";
            </script>
        `);

    } catch (error) {
        console.error(error);
        res.status(500).send('The password could not be updated.');
    }
});

module.exports = router;
