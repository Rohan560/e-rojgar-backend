const mongoose = require("mongoose");
const constants = require("../constants");

const userSchema = mongoose.Schema({
    name: {
        type:String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: constants.roles
    },
    password: {
        type: String,
        required: true,
    },
    // job seeker specific properties
    dob: String,
    address: String,
    occupation: String,
    experience: String,
    qualification: String,
    phoneNumber: String,
    savedJobs: [{
        type: mongoose.Types.ObjectId,
        ref: "Job"
    }],
    postCount: {
        type: Number,
        default: 0,
    },
    // employer specific
    website: String,
})

const User = mongoose.model("User", userSchema) ;

module.exports = User ;