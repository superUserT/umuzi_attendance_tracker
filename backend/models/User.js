const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  surname: String,
  email: { type: String, required: true, unique: true },
  totalPoints: { type: Number, default: 0 },
  // Updated to store detailed log
  attendanceLog: [{
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    eventTitle: String,
    eventHost: String,
    dateScanned: { type: Date, default: Date.now },
    pointsEarned: Number
  }]
});

module.exports = mongoose.model('User', UserSchema);