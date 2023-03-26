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
  name: {
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

// define a User model based on the user schema
const User = mongoose.model("User", userSchema);
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
    const av_users_list = Avilableuser_list.find(
      {},
      function (err, av_users_list) {
        // console.log(av_users_list);
        res.render(filename, { username: email, av_users: av_users_list });
      }
    );
  } else if (filename === "Student_home")
    res.render(filename, { username: email });
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
    console.log(std_req);
    std_req.save((err) => {
      if (err) {
        console.log(err);
        req.flash("error", "Error for submiting request");
        return res.redirect("/");
      }
      // console.log(user);
      res.redirect("/");
    });
  } else {
    res.send("data can't send try again");
  }
});

app.post("/driver_req", function (req, res) {
  const { price, d_req_with_price } = req.body;
  const avAuto = JSON.parse(d_req_with_price);

  console.log(req.body);
  console.log(avAuto.name);
  console.log(avAuto.role);
  console.log(avAuto.to);
  console.log(price);
});

// start the server
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
