
const express = require('express');
const path = require('path');
const app = express();
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const userRoutes = require('./Routes/user.routes');
const auth = require('./Middleware/auth');
const votingRoutes = require('./Routes/voting.routes');
const path = require('path');

require('dotenv').config();
const PORT = process.env.PORT;  
const MONGOSE = process.env.MONGOSE;
publicBaseUrl: process.env.APP_URL

mongoose.connect(MONGOSE)
    .then(() => {
        console.log("MongoDB Connected Successfully");
    })
    
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/', userRoutes);
app.use('/voting', votingRoutes);



// Welcome page
app.get('/', (req, res) => {
    res.render('welcome.ejs');
});

// Login page
app.get('/login', (req, res) => {
    res.render('login.ejs');
});


app.get('/register',(req,res)=>{
    res.render('register.ejs',{
        message: req.query.message 
    });
})


app.get('/dashboard', auth, (req, res) => {
    res.render('dashboard');
});

app.listen(PORT, () => {
    console.log(`The Port Number is: ${PORT}`); 
});