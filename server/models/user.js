const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  firstName: String,
  lastName: String,
  savedHouses: [Object], // Future feature!
});

module.exports = mongoose.model('User', UserSchema);
