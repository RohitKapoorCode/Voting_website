
const express = require('express');
const path = require('path');
const app = express();

require('dotenv').config();
const PORT = process.env.PORT;  


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

app.get('/forgetpassword',(req,res)=>{
    res.render('forgetpassword.ejs')
})


app.listen(PORT, () => {
    console.log(`The Port Number is: ${PORT}`); 
});
