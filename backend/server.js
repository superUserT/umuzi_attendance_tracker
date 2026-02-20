require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Event = require('./models/Event');
const User = require('./models/User');

const app = express();


app.use(cors());
app.use(express.json());

const allowedOrigins = [
  'http://localhost:5173', 
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));


app.post('/api/events', async (req, res) => {
  try {
    const { title, description, host, eventType, durationMinutes } = req.body;


    const pointsMap = { 'short_online': 5, 'long_online': 10, 'in_person': 15 };
    const points = pointsMap[eventType];

    const newEvent = new Event({
      title,
      description,
      host,
      eventType,
      points,
      durationMinutes
    });

    await newEvent.save();
    res.json(newEvent);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/admin/data', async (req, res) => {
  try {
    const events = await Event.find().sort({ startTime: -1 });
    const users = await User.find().sort({ totalPoints: -1 });
    res.json({ events, users });
  } catch (err) {
    console.error("Error fetching admin data:", err);
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/events/:id/validate', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ valid: false, message: "Event not found" });

    if (!event.isLive()) {
      return res.status(400).json({ valid: false, message: "This QR Code has expired." });
    }

 
    res.json({
      valid: true,
      eventTitle: event.title,
      host: event.host,
      description: event.description,
      points: event.points
    });
  } catch (err) {
    console.error("Error validating event:", err);
    res.status(500).json({ valid: false });
  }
});


app.post('/api/attend', async (req, res) => {
  const { eventId, name, surname, email } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event || !event.isLive()) {
      return res.status(400).json({ error: "Event expired or invalid" });
    }

  
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, surname, email });
    }


    const alreadyAttended = user.attendanceLog.some(
      (log) => log.eventId.toString() === eventId
    );

    if (alreadyAttended) {
      return res.status(400).json({ error: "You have already scanned in for this event." });
    }


    user.attendanceLog.push({
      eventId: event._id,
      eventTitle: event.title,
      eventHost: event.host,
      dateScanned: new Date(),
      pointsEarned: event.points
    });


    user.totalPoints += event.points;
    user.name = name;
    user.surname = surname;

    await user.save();

    res.json({
      success: true,
      pointsAdded: event.points,
      totalPoints: user.totalPoints
    });
  } catch (err) {
    console.error("Error submitting attendance:", err);
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));