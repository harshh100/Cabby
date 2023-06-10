const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
    // console.log(req.user.email);
    if (req.user) {
      res.render("info", { username: req.user.email });
    } else {
      res.redirect("/");
    }
  });

module.exports = router;