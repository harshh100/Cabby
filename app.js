const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require("body-parser");
const ejs = require("ejs");
var flash = require("connect-flash");
const mongoose = require("mongoose");
const app = express();

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

// define a user schema
const trip_list_Schema = new mongoose.Schema({
  sen_name: {
    type: String,
    require: true,
  },
  rec_name: {
    type: String,
    require: true,
  },
  to: {
    type: String,
    require: true,
  },
  from: {
    type: String,
    require: true,
  },
  time: {
    type: String,
    require: true,
  },
  date: {
    type: String,
    require: true,
  },
  passengers: {
    type: Number,
    require: true,
  },
  price: {
    type: Number,
    require: true,
  },
  phoneno: {
    type: String,
    require: true,
  },
});

const req_Avi_userlist_Schema = new mongoose.Schema({
  email: {
    type: String,
    require: true,
  },
  role: {
    type: String,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  from: {
    type: String,
    require: true,
  },
  to: {
    type: String,
    require: true,
  },
  time: {
    type: String,
    require: true,
  },
  date: {
    type: String,
    require: true,
  },
  passengers: {
    type: Number,
    require: true,
  },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    unique: true,
    require: true,
    // trim: true,
    //  match: [/@charusat.edu.in$/, 'please fill a valid email']
  },
  password: {
    type: String,
    require: true,
  },
  phoneno: {
    type: String,
    require: true,
  },
  gender: {
    type: String,
    require: true,
  },
  role: {
    type: String,
    require: true,
  },
  Adv_B_list: [trip_list_Schema],
  Confirm_avi_list: [trip_list_Schema],
  req_avi_list: [req_Avi_userlist_Schema],
});

// const driver_bio_Schema = new mongoose.Schema({
//   fris_name: {
//     type: String,
//     require: true,
//   },
//   last_name: {
//     type: String,
//     require: true,
//   },
//   birtdate: {
//     type: String,
//     require: true,
//   },
//   mobile: {
//     type: String,
//     require: true,
//   },
//   licence_number: {
//     type: String,
//     require: true,
//   },
//   vehicle_number: {
//     type: String,
//     require: true,
//   },
//   email: {
//     type: Number,
//     require: true,
//     unique: true,
//   },
//   joining_date: {
//     type: String,
//     require: true,
//   },
// });

// define a User model based on the user schema
const User = mongoose.model("User", userSchema);
// const Driver_bio = mongoose.model("Driver_bio", driver_bio_Schema);
const Avilableuser_list = mongoose.model(
  "Avilableuser",
  req_Avi_userlist_Schema
);
const AvilableAuto_list = mongoose.model("AvilableAuto", trip_list_Schema);
// configure passport to use LocalStrategy for authentication
passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ email }, (err, user) => {
      // console.log(user);
      if (err) return done(err);
      if (!user) {
        return done(null, false, { message: "Invalid email or password" });
      }
      if (user.password !== password) {
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
app.get("/login", (req, res) => {
  res.render("login", { message: req.flash("error") });
});

// route for handling login form submission
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    usernameField: "email",
  })
);

// route for logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      // Redirect to the login page or homepage
      res.redirect("/login");
    }
  });
});

// route for user signup form
app.get("/sign_up", (req, res) => {
  res.render("sign_up", { message: req.flash("error") });
});

// route for handling user signup form submission
app.post("/sign_up", (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phoneno: req.body.phoneno,
    gender: req.body.gender,
    role: req.body.role,
  });

  // const bio = new Driver_bio({
  //   fris_name: "-",
  //   last_name: "-",
  //   birtdate: "-",
  //   mobile: ,
  //   licence_number: {
  //     type: String,
  //     require: true,
  //   },
  //   vehicle_number: {
  //     type: String,
  //     require: true,
  //   },
  //   email: {
  //     type: Number,
  //     require: true,
  //     unique: true,
  //   },
  //   joining_date: {
  //     type: String,
  //     require: true,
  //   },
  // })

  user.save((err) => {
    if (err) {
      console.log(err);
      req.flash("error", "Error creating user");
      return res.redirect("/sign_up");
    }
    // console.log(user);
    res.redirect("/login");
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

app.get("/info", function (req, res) {
  // console.log(req.user.email);
  if (req.user) {
    res.render("info", { username: req.user.email });
  } else {
    res.redirect("/");
  }
});

app.get("/driver_profile", function (req, res) {
  // console.log(req.user.email);
  if (req.user) {
    res.render("driver_profile", { username: req.user.email });
  } else {
    res.redirect("/");
  }
});

// start the server
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
