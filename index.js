
const express = require('express');
const path = require('path');
const app = express();
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');

require('dotenv').config();
const PORT = process.env.PORT;  
const MONGOSE = process.env.MONGOSE;

mongoose.connect(MONGOSE)
    .then(() => {
        console.log("MongoDB Connected Successfully");
    })
    

app.use(express.static('public'));


// Welcome page
app.get('/', (req, res) => {
    res.render('welcome.ejs');
});

// Login page
app.get('/login', (req, res) => {
    res.render('login.ejs');
});


app.get('/register',(req,res)=>{
    res.render('register.ejs');
})


app.listen(PORT, () => {
    console.log(`The Port Number is: ${PORT}`); 
});