const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' }, // New Field
  host: { type: String, required: true },     // New Field
  eventType: { type: String, enum: ['short_online', 'long_online', 'in_person'], required: true },
  points: { type: Number, required: true },
  durationMinutes: { type: Number, required: true },
  startTime: { type: Date, default: Date.now },
});

// Virtual to check if event is still live
EventSchema.methods.isLive = function() {
  const now = new Date();
  const endTime = new Date(this.startTime.getTime() + this.durationMinutes * 60000);
  return now <= endTime;
};

module.exports = mongoose.model('Event', EventSchema);