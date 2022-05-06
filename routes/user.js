const express = require("express");
const { requireLogin } = require("../functions");
const Job = require("../models/job");
const User = require("../models/user");

const router = express.Router();

router.post("/register", async function (req, res) {
    try {
        const { email, password, name, role } = req.body;
        if (!(email && password && role && name)) throw new Error("Email, password, name or role is missing.");

        let rawUser = { email, password, role, name };

        if (email.indexOf("@") == -1) throw new Error("Invalid Email");
        if (password.length < 8) throw new Error("Password must be more than 8 characters.");

        if (await User.findOne({ email })) throw new Error("Email already taken. Try new one.");

        await User.create(rawUser).then(user => res.send({
            status: "success",
            user
        }));

    } catch (e) {
        res.send({
            status: "fail",
            error: e.toString()
        })
    }
})

router.post("/login", async function (req, res) {
    try {
        const { email, password } = req.body;
        if (!(email && password)) throw new Error("Email or password is missing.");

        let rawUser = { email, password };

        const user = await User.findOne(rawUser);

        if (user) return res.send({ status: "success", user: user });
        throw new Error("Invalid Credentials.");
    } catch (e) {
        res.send({
            status: "fail",
            error: e.toString()
        })
    }
})

const meRouter = express.Router();

router.use("/me", requireLogin, meRouter);

meRouter.get("/", function (req, res) {
    res.send({ status: "success", user: req.user });
})

meRouter.put("/", async function (req, res) {
    try {

        if (req.body.name && req.body.name.trim().length > 1) {
            req.user.name = req.body.name.trim();
        } else throw new Error("Name must have more characters.");


        req.user.address = req.body.address;

        req.user.phoneNumber = req.body.phoneNumber;

        req.user.occupation = req.body.occupation;

        req.user.experience = req.body.experience;

        req.user.dob = req.body.dob;

        req.user.qualification = req.body.qualification;

        req.user.website = req.body.website ;

        await req.user.save();

        res.send({
            status: "success",
            user: req.user,
        });


    } catch (e) {
        res.send({
            status: "fail",
            error: e.toString()
        })
    }

});


// get saved jobs
meRouter.get("/saved", async function(req, res){
    try{
        return res.send({
            status: "success",
            jobs: await Job.find({_id: {$in: req.user.savedJobs}}),
        })
    }catch(e){
        res.send({
            status: "fail",
            error: e.toString()
        })
    }
})

// get applied jobs
meRouter.get("/applied", async function(req, res){
    try{
        return res.send({
            status: "success",
            jobs: await Job.find({applications:  req.user._id}),
        })
    }catch(e){
        res.send({
            status: "fail",
            error: e.toString()
        })
    }
})


// get posted job count
meRouter.get("/jobCount", async function(req, res){
    try{
        return res.send({
            status: "success",
            jobCount: await Job.count({postedBy:  req.user._id}),
        })
    }catch(e){
        res.send({
            status: "fail",
            error: e.toString()
        })
    }
})

module.exports = router