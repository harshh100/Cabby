const mongoose = require("mongoose");
const trip_list_Schema = require("./trip_list_Schema");
const req_Avi_userlist_Schema = require("./req_Avi_userlist_Schema");

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

module.exports = userSchema;
