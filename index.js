const express = require('express');
const app = express();
const PORT = 5500;

app.use(express.urlencoded({extended:false}))

app.listen(PORT,(req,res)=>{
    console.log(`The Port Number is:${PORT}`)
})


app.get('/',(req,res)=>{
    res.send("Hello Voter Users");
})