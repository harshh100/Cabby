const mongoose = require("mongoose");

const driver_bio_Schema = new mongoose.Schema({
  frist_name: {
    type: String,
    require: true,
  },
  last_name: {
    type: String,
    require: true,
  },
  birtdate: {
    type: String,
    require: true,
  },
  mobile: {
    type: String,
    require: true,
  },
  li_number: {
    type: String,
    require: true,
  },
  ve_number: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  j_date: {
    type: String,
    require: true,
  },
});

module.exports = driver_bio_Schema;
