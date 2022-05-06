const mongoose = require("mongoose")

const jobSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },

    jobType: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    eligibleFor: {
        type: String,
        required: true,
    },
    skills: {
        type: String,
        required: true,
    },
    selectionProcess: {
        type: String,
        required: true,
    },
    jobDescription: {
        type: String,
        required: true,
    },
    salary: {
        type: String,
        required: true,
    },
    deadline: {
        type: Date,
        required: true,
    },
    website: String,
    phoneNumber: String,
    email: String,
    postedBy: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    createdAt: Date,
    applications: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User",
        }
    ],
});

const  Job = mongoose.model("Job", jobSchema);

module.exports = Job