const express = require("express");
const Job = require("../models/job");
const User = require("../models/user");

const router = express.Router() ;

router.get("/stats", async function(req, res){
    try{
        const jobSeekers = await User.count({role: 'job-seeker'}) ;
        const employers = await User.count({role: 'employer'}) ;
        const jobs = await Job.find({}, "applications") ;
        let applications = 0 ;
        jobs.forEach(j => applications += j.applications.length) ;
    
        res.send({
            status: "success",
            stats: {
                jobSeekers, employers, jobs: jobs.length, applications
            }
        })
    }catch(e){
        res.send({
            status: "fail",
            error: e.toString()
        })
    }
})

module.exports = router