const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: true // 'google' or 'github'
  },
  providerId: {
    type: String,
    required: true, // id from Google/GitHub
    unique: true
  },
  displayName: String,
  email: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
