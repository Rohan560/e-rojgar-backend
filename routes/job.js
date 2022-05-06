const express = require("express");
const { default: mongoose } = require("mongoose");
const { requireLogin } = require("../functions");
const Job = require("../models/job");
const User = require("../models/user");
const router = express.Router();

// get all jobs
router.get("/", async function (req, res) {
    res.send({
        status: "success",
        jobs: await Job.find({ deadline: { $gt: Date() } }).sort({ createdAt: -1 }),
    })
})

// get jobs by specific user
router.get("/by/:user_id", async function (req, res) {
    try {
        const userId = req.params.user_id;
        if (!userId) throw new Error("User id not found");
        const jobs = await Job.find({ postedBy: mongoose.Types.ObjectId(req.params.user_id), }).sort({ createdAt: -1 });
        return res.send({ status: "success", jobs: jobs });
    } catch (e) {
        return res.send({ status: "fail", error: e.toString() })
    }
});

//create new job
router.post("/", requireLogin, async function (req, res) {

    try {
        if (!(req.user.role == 'admin' || req.user.role == 'employer')) throw new Error("Only admin or employer can post a job.");
        const properties = ['title', 'companyName', 'location', 'jobType', 'category', 'eligibleFor', 'skills', 'selectionProcess', 'jobDescription', 'salary', 'deadline', 'website', 'phoneNumber', 'email'];
        let rawJob = {}
        properties.forEach(function (p) {
            if (!req.body.hasOwnProperty(p)) throw new Error("Property '" + p + "' is requrired.");
            rawJob[p] = req.body[p];
        })
        rawJob['deadline'] = new Date(parseInt(rawJob['deadline']));

        rawJob['postedBy'] = req.user._id;

        rawJob['createdAt'] = new Date();

        const job = await Job.create(rawJob);

        // incrementing post count of user
        req.user.postCount++ ;
        await req.user.save() ;

        return res.send({
            status: "success",
            job: job
        });

    } catch (e) {
        return res.send({
            status: "fail",
            error: e.toString()
        });
    }

});

//single job router
const singleJobRouter = express.Router();

router.use("/:job_id", async function (req, res, next) {
    try {
        if (!req.params.job_id) throw new Error("job_id is requird");
        req.currentJob = await Job.findById(req.params.job_id);
        if (!req.currentJob) throw new Error("Job not found");
        return next();
    } catch (e) {
        return res.send({ status: "fail", error: e.toString() });
    }
}, singleJobRouter)


// get single job
singleJobRouter.get("/", function (req, res) {
    res.send({ status: "success", job: req.currentJob });
})

// edit job
singleJobRouter.put("/", requireLogin, async function (req, res) {

    try {
        const properties = ['title', 'companyName', 'location', 'jobType', 'category', 'eligibleFor', 'skills', 'selectionProcess', 'jobDescription', 'salary', 'deadline', 'website', 'phoneNumber', 'email'];
        let rawJob = {}
        properties.forEach(function (p) {
            if (!req.body.hasOwnProperty(p)) throw new Error("Property '" + p + "' is requrired.");
            rawJob[p] = req.body[p];
        })
        rawJob['deadline'] = new Date(parseInt(rawJob['deadline']));

        properties.forEach(prop => {
            req.currentJob.set(prop, rawJob[prop]) ;
        })

        await req.currentJob.save() ;

        return res.send({
            status: "success",
            job: req.currentJob
        });

    } catch (e) {
        return res.send({
            status: "fail",
            error: e.toString()
        });
    }

});


// apply/unapply to a job
singleJobRouter.post("/toggleApplication", requireLogin, async function (req, res) {
    try {
        if (req.currentJob.applications.map(a => a.toString()).indexOf(req.user._id.toString()) == -1) {
            req.currentJob.applications.push(req.user._id);
        } else {
            req.currentJob.applications.pop(req.user._id);
        }
        return res.send({
            status: "success",
            job: await req.currentJob.save()
        })
    } catch (e) {
        return res.send({
            status: "fail",
            error: e.toString()
        })
    }
})

// saving / unsaving a job
singleJobRouter.post("/toggleSave", requireLogin, async function (req, res) {
    try {
        if (req.user.savedJobs.map(j => j.toString()).indexOf(req.currentJob._id.toString()) == -1) {
            req.user.savedJobs.push(req.currentJob._id);
        } else {
            req.user.savedJobs.pop(req.currentJob._id);
        }
        await req.user.save();
        return res.send({
            status: "success",
            user: req.user,
        })
    } catch (e) {
        return res.send({
            status: "fail",
            error: e.toString()
        })
    }
})

// viewing applications
singleJobRouter.get("/applications", requireLogin, async function (req, res) {
    try {
        return res.send({
            status: "success",
            applications: await User.find({ _id: { $in: req.currentJob.applications } }),
        })
    } catch (e) {
        return res.send({
            status: "fail",
            error: e.toString()
        })
    }
})

// deleting a job
singleJobRouter.delete("/", requireLogin, async function (req, res) {
    try {
        if (req.user.role != 'admin' && req.user._id.toString() != req.currentJob.postedBy.toString()) {
            throw new Error("Only owner or admin can delete a job.");
        }
        await req.currentJob.delete();
        res.send({
            status: "success",
            job: null
        }) ;
    } catch (e) {
        return res.send({
            status: "fail",
            error: e.toString()
        })
    }
})

module.exports = router;
