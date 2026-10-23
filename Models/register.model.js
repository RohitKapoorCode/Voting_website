const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Register = new Schema({
    fullname: {
        type: String,
        required: true
    },
    emailid: {
        type: String,
        unique: true,
        required: true
    },
    Password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Registervoter", Register, "register");