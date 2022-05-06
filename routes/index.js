const express = require("express");
const { checkUserInRequest, requireLogin } = require("../functions");
const userRouter = require("./user")
const jobRouter = require("./job")
const adminRouter = require("./admin")

const router = express.Router();

// check if user exists in request
router.use(function (req, res, next) {
    // loggin current request
    console.log(req.method + " " + req.url)
    next();
});


router.use(checkUserInRequest)

router.use("/users", userRouter)
router.use("/jobs", jobRouter)
router.use("/admin", requireLogin, function (req, res, next) {
    if (req.user.role == 'admin') {
        return next();
    }
    return res.send({
        status: "fail",
        error: "Admin Only."
    });
}, adminRouter);


module.exports = router