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
    // Replace hardcoded fields with a dynamic answers array
    answers: [{
      question: String,
      answer: String
    }]
  }]
});

module.exports = mongoose.model('User', UserSchema);