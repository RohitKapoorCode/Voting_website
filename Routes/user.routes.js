const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require("../Models/register.model")
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config()



// Welcome
router.get('/', (req, res) => {
    res.render('welcome.ejs');
});


// login
router.post('/login', async (req, res) => {
    const { emailid, password } = req.body;

    const user = await User.findOne({ emailid });

 if (!user) {
    return res.send(`
        <script>
            alert("You are not a user. Please register");
            window.location.href = "/register";
        </script>
    `);
}

    const isMatch = await bcrypt.compare(password, user.Password);

    if (!isMatch) {
        return res.status(400).json({
            message: "Invalid credentials"
        });
    }

    const token = jwt.sign(
        { registerId: user._id, fullname: user.fullname },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    return res.status(200).json({
        message: "Login successful",
        token: token
    });
});


// register
router.post('/register', async(req,res)=>{
    try{
        const  { fullname, emailid ,Password } = req.body
        const existinguser = await User.findOne({ $or: [{fullname},{emailid }]})
        if(existinguser) return res.status(400).json({message:"fullname and emailid is already exist"})

        const hasedpassword = await bcrypt.hash(Password, 10)
            const register = new User({fullname, emailid ,Password: hasedpassword})
            const savedregister = await register.save()

            res.json(savedregister)
    }
    catch(error){
        res.status(500).json({meassage: error.message})
    }
})


module.exports = router;





