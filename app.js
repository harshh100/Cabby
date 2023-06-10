const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require("body-parser");
const ejs = require("ejs");
const bcrypt = require("bcryptjs");
var flash = require("connect-flash");
const mongoose = require("mongoose");
const app = express();
let port = 4000;

// configure body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(flash());
mongoose.set("strictQuery", false);
// configure session
app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: false,
  })
);

// configure passport
app.use(passport.initialize());
app.use(passport.session());

// configure EJS as the template engine
app.set("view engine", "ejs");

mongoose
  .connect("mongodb://127.0.0.1:27017/CabbyDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected!"))
  .catch((err) => console.log(err));

// define a schemas
const trip_list_Schema = require("./models/trip_list_Schema");
const req_Avi_userlist_Schema = require("./models/req_Avi_userlist_Schema");
const driver_bio_Schema = require("./models/driver_bio_Schema");
const userSchema = require("./models/userSchema");

// define a User model based on the user schema
const User = mongoose.model("User", userSchema);
const Driver_bio = mongoose.model("Driver_bio", driver_bio_Schema);
const Avilableuser_list = mongoose.model(
  "Avilableuser",
  req_Avi_userlist_Schema
);
const AvilableAuto_list = mongoose.model("AvilableAuto", trip_list_Schema);

// configure passport to use LocalStrategy for authentication
passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ email }, async (err, user) => {
      // console.log(user);
      if (err) return done(err);
      if (!user) {
        return done(null, false, { message: "Invalid email or password" });
      }
      const passwordcorrect = await bcrypt.compare(password, user.password)
      if (!passwordcorrect) {
        return done(null, false, { message: "Invalid email or password" });
      }
      return done(null, user);
    });
  })
);

// serialize user for session storage
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// deserialize user from session storage
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    if (err) return done(err);
    done(null, user);
  });
});

// route for login form
// app.get("/login", (req, res) => {
//   res.render("login", { message: req.flash("error") });
// });
app.use("/login", require("./routes/login"));

// route for handling login form submission
app.post(
  "/login",
  passport.authenticate("local", {
    // successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    usernameField: "email",
  }), function (req, res) {
    if (req.body.remember) {
      // Set a cookie that expires in 30 days
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    }
    res.redirect('/');
  }
);

// route for logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      // Redirect to the login page 
      res.redirect("/login");
    }
  });
});

// route for user signup form
app.get("/sign_up", (req, res) => {
  res.render("sign_up", { message: req.flash("error") });
});

// route for handling user signup form submission
app.post("/sign_up", async (req, res) => {

  const salt = await bcrypt.genSalt();
  const haspassword = await bcrypt.hash(req.body.password, salt);
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: haspassword,
    phoneno: req.body.phoneno,
    gender: req.body.gender,
    role: req.body.role,
  });

  function formatDate(date) {
    var year = date.getFullYear();
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    return year + "-" + month + "-" + day;
  }
  var today = new Date();
  let j_d = formatDate(today);

  const bio = new Driver_bio({
    frist_name: req.body.name,
    last_name: "-",
    birtdate: "-",
    mobile: req.body.phoneno,
    li_number: "-",
    ve_number: "-",
    email: req.body.email,
    j_date: j_d,
  });

  // console.log(bio);

  user.save((err) => {
    if (err) {
      console.log(err);
      req.flash("error", "Error creating user");
      return res.redirect("/sign_up");
    }
    if (req.body.role == "Auto-driver") {
      bio.save((err) => {
        if (err) {
          req.flash("error", "Error creating user bio");
          return res.redirect("/sign_up");
        }
      });
    }
    res.redirect("/login");

    // console.log(user);
  });
});

app.get("/", (req, res) => {
  // console.log(req.user);
  if (!req.user) {
    // console.log(req.user);
    return res.redirect("/login");
  }
  const role = req.user.role;
  const email = req.user.email;
  const filename = role === "Auto-driver" ? "driver_home" : "Student_home";
  if (filename === "driver_home") {
    User.findOne({ email: email }, function (err, founduser) {
      res.render(filename, {
        username: email,
        av_users: founduser.req_avi_list,
        cn_users: founduser.Confirm_avi_list,
      });
    });
  } else if (filename === "Student_home") {
    User.findOne({ email: email }, function (err, founduser) {
      res.render(filename, {
        username: email,
        av_auto: founduser.Confirm_avi_list,
        phn: founduser.phoneno,
      });
    });
  }
});

app.post("/student_req", function (req, res) {
  if (req.user && req.body) {
    // console.log(req.body);
    // console.log(req.user.email);
    // console.log(req.user.role);
    // console.log(req.user.name);
    // console.log(req.body.from);
    // console.log(req.body.to);
    // console.log(req.body.time);
    // console.log(req.body.date);
    // console.log(req.body.passengers);
    const std_req = new Avilableuser_list({
      email: req.user.email,
      role: req.user.role,
      name: req.user.name,
      from: req.body.from,
      to: req.body.to,
      time: req.body.time,
      date: req.body.date,
      passengers: req.body.passengers,
    });

    User.updateMany(
      { role: "Auto-driver" },
      {
        $push: {
          req_avi_list: {
            email: req.user.email,
            role: "Auto-driver",
            name: req.user.email,
            from: req.body.from,
            to: req.body.to,
            time: req.body.time,
            date: req.body.date,
            passengers: req.body.passengers,
          },
        },
      },
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          // console.log(result);.
          res.redirect("/");
        }
      }
    );
  }
});

app.post("/con_drv", function (req, res) {
  if (req.user && req.body) {
    // console.log("/con_drv");
    // console.log(req.body.d_req_with_price);
    const con_b = req.body.d_req_with_price;
    const student_name = req.body.student_name;
    const phn = req.body.phn;
    // console.log(con_b);
    // console.log(student_name);
    const Con_b = JSON.parse(con_b);
    // console.log(Con_b);
    //new code
    User.findOneAndUpdate(
      { email: Con_b.rec_name }, // specify the user's email
      {
        $push: {
          Adv_B_list: {
            sen_name: Con_b.sen_name,
            rec_name: Con_b.rec_name,
            role: "Student",
            from: Con_b.from,
            to: Con_b.to,
            time: Con_b.time,
            date: Con_b.date,
            passengers: Con_b.passengers,
            price: Con_b.price,
            phoneno: phn,
          },
        },
        $pull: {
          Confirm_avi_list: {
            from: Con_b.from,
            to: Con_b.to,
            time: Con_b.time,
            date: Con_b.date,
            passengers: Con_b.passengers,
          },
        },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
        } else {
          // console.log(updatedUser);
        }
      }
    );

    User.updateOne(
      { email: Con_b.sen_name }, // specify the user's email
      {
        $push: {
          Confirm_avi_list: {
            sen_name: Con_b.sen_name,
            rec_name: Con_b.rec_name,
            role: "Student",
            from: Con_b.from,
            to: Con_b.to,
            time: Con_b.time,
            date: Con_b.date,
            passengers: Con_b.passengers,
            price: Con_b.price,
            phoneno: phn,
          },
          Adv_B_list: {
            sen_name: Con_b.sen_name,
            rec_name: Con_b.rec_name,
            role: "Student",
            from: Con_b.from,
            to: Con_b.to,
            time: Con_b.time,
            date: Con_b.date,
            passengers: Con_b.passengers,
            price: Con_b.price,
            phoneno: phn,
          },
        },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
        } else {
          // console.log(updatedUser);
        }
      }
    );

    User.updateMany(
      { role: "Auto-driver" },
      {
        $pull: {
          req_avi_list: {
            email: Con_b.rec_name,
            from: Con_b.from,
            to: Con_b.to,
            time: Con_b.time,
            date: Con_b.date,
            passengers: Con_b.passengers,
          },
        },
      },
      (err, result) => {
        if (err) {
          console.error(err);
        } else {
          // console.log(result);
          res.redirect("/");
        }
      }
    );
  }

  // console.log(avAuto.name);
  // console.log(avAuto.role);
  // console.log(avAuto.to);
  // console.log(price);
});

app.post("/driver_req", function (req, res) {
  if (req.user && req.body) {
    // console.log(req.body);
    const { price, d_req_with_price, driver_name } = req.body;
    const avAuto = JSON.parse(d_req_with_price);
    // console.log(avAuto);
    // console.log(driver_name);
    // console.log(avAuto.to);
    // console.log(avAuto.from);
    const d_req = new AvilableAuto_list({
      rec_name: avAuto.email,
      role: avAuto.role,
      sen_name: driver_name,
      from: avAuto.from,
      to: avAuto.to,
      time: avAuto.time,
      date: avAuto.date,
      passengers: avAuto.passengers,
      price: price,
    });

    User.updateOne(
      { email: driver_name }, // specify the user's email
      {
        $pull: {
          req_avi_list: {
            email: avAuto.email,
            from: avAuto.from,
            to: avAuto.to,
            time: avAuto.time,
            date: avAuto.date,
            passengers: avAuto.passengers,
          },
        },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
        } else {
          // console.log(updatedUser);
        }
      }
    );

    User.findOne({ email: avAuto.email }, function (err, founduser) {
      if (err) {
        console.log(err);
      } else {
        founduser.Confirm_avi_list.push(d_req);
        founduser.save();
        res.redirect("/");
      }
    });

    // console.log(req.body);
    // console.log(avAuto.name);
    // console.log(avAuto.role);
    // console.log(avAuto.to);
    // console.log(price);
  }
});

app.get("/Advance_Booking", function (req, res) {
  const role = req.user.role;
  const email = req.user.email;
  // console.log(role);
  // console.log(email);

  if (role == "Student") {
    User.findOne({ email: email }, function (err, founduser) {
      // console.log(role);
      // console.log(email);

      res.render("user_Advance_Booking_list", {
        username: email,
        Adv_B_l: founduser.Adv_B_list,
      });
    });
  } else if (role == "Auto-driver") {
    // console.log(role);
    // console.log(email);
    User.findOne({ email: email }, function (err, founduser) {
      res.render("driver_Advance_Booking_List", {
        username: email,
        Adv_B_l: founduser.Adv_B_list,
      });
    });
  }
});

app.post("/remove_f_con_u", function (req, res) {
  // console.log(req.body);
  const id = req.body._id;
  const driver_name = req.body.driver_n;

  User.updateOne(
    { email: driver_name }, // specify the user's email
    {
      $pull: {
        Confirm_avi_list: {
          _id: id,
        },
      },
    },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
      } else {
        res.redirect("/");
        // console.log(updatedUser);
      }
    }
  );
});

// app.get("/info", function (req, res) {
//   // console.log(req.user.email);
//   if (req.user) {
//     res.render("info", { username: req.user.email });
//   } else {
//     res.redirect("/");
//   }
// });

app.use("/info", require("./routes/info"));

app.get("/driver_profile", function (req, res) {
  // console.log(req.user.email);
  if (req.user) {
    Driver_bio.findOne({ email: req.user.email }, function (err, founduser) {
      res.render("driver_profile", {
        username: req.user.email,
        First_Name: founduser.frist_name,
        licence_Number: founduser.li_number,
        Last_Name: founduser.last_name,
        Vehicle_Number: founduser.ve_number,
        Birthday: founduser.birtdate,
        Mobile: founduser.mobile,
        Cabby_joining_date: founduser.j_date,
      });
    });
  } else {
    res.redirect("/");
  }
});

app.get("/edit_driver_profile", function (req, res) {
  // console.log(req.user.email);
  if (req.user) {
    Driver_bio.findOne({ email: req.user.email }, function (err, founduser) {
      res.render("edit_driver_profile", {
        username: req.user.email,
        First_Name: founduser.frist_name,
        licence_Number: founduser.li_number,
        Last_Name: founduser.last_name,
        Vehicle_Number: founduser.ve_number,
        Birthday: founduser.birtdate,
        Mobile: founduser.mobile,
        Cabby_joining_date: founduser.j_date,
      });
    });
  } else {
    res.redirect("/");
  }
});

app.post("/edit_driver_profile", function (req, res) {
  // console.log(req.user.email);
  if (req.user) {
    // Driver_bio.findOneAndUpdate;
    // console.log(req.body);

    let updateObject = {};
    if (req.body.frist_name !== "") {
      updateObject.frist_name = req.body.frist_name;
    }
    if (req.body.li_number !== "") {
      updateObject.li_number = req.body.li_number;
    }
    if (req.body.last_name !== "") {
      updateObject.last_name = req.body.last_name;
    }
    if (req.body.ve_number !== "") {
      updateObject.ve_number = req.body.ve_number;
    }
    if (req.body.birthdate !== "") {
      updateObject.birtdate = req.body.birthdate;
    }
    if (req.body.mobile !== "") {
      updateObject.mobile = req.body.mobile;
    }

    Driver_bio.findOneAndUpdate(
      { email: req.user.email },
      updateObject,
      { new: true },
      function (err, doc) {
        if (err) {
          console.log("Error updating profile:", err);
          res.redirect("/driver_profile");
        } else {
          // console.log("Profile updated successfully:", doc);
          res.redirect("/driver_profile");
        }
      }
    );
    // res.redirect("/driver_profile");
  } else {
    res.redirect("/");
  }
});

// start the server
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
