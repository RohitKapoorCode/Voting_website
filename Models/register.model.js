

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Register = new Schema ({
  fullname: {
    type: String,
    unqiue: true,   
    required: true
  },
  emailid : {
    type: String,
    unqiue: true,
    required: true
  },
  Password: {
    type: String,
    unqiue: true,
    required: true
  } 
});

module.exports = mongoose.model("Registervoter", Register );