const User = require("./models/user");

module.exports.requireLogin = function (req, res, next) {
    if (!req.user) {
        return res.send({ status: "fail", error: "Login Needed" });
    }
    next();
}

module.exports.checkUserInRequest = async function (req, res, next) {
    // console.log(req.headers)
    if (req.headers.hasOwnProperty("userid")) {
        try {
            const user = await User.findById(req.headers.userid);
            if (user) {
                req.user = user;
            }
        } catch (e) {
            console.log("INvalid userid in reuquest: " + e.toString());
        }
    }
    next();
}
