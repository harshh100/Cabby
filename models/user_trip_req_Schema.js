const mongoose = require("mongoose");

const user_trip_req_Schema = new mongoose.Schema({
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

const user_trip_req = new mongoose.model("user_trip_req", user_trip_req_Schema);
module.exports = user_trip_req;
