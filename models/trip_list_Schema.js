const mongoose = require("mongoose");

const trip_list_Schema = new mongoose.Schema({
  sen_name: {
    type: String,
    require: true,
  },
  rec_name: {
    type: String,
    require: true,
  },
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

module.exports = trip_list_Schema;
