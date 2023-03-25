const mongoose = require("mongoose");
// const user_trip_req = require("user_trip_req_Schema.js");
// const trip_list = require("trip_list_Schema.js");

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
const clientSchema = new mongoose.Schema({
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
  Availebel_list: [trip_list_Schema],
});

module.exports = clientSchema;
