const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  surname: String,
  email: { type: String, required: true, unique: true },
  totalPoints: { type: Number, default: 0 },
  attendanceLog: [{
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    eventTitle: String,
    eventHost: String,
    dateScanned: { type: Date, default: Date.now },
    pointsEarned: Number,
    // 5 New Fields Added Below
    motivation: String,
    commChannel: String,
    funActivity: String,
    umuziMetaphor: String,
    lookingForward: String
  }]
});

module.exports = mongoose.model('User', UserSchema);