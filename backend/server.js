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
  // Added the 5 new fields to the destructuring
  const { 
    eventId, name, surname, email, 
    motivation, commChannel, funActivity, umuziMetaphor, lookingForward 
  } = req.body;

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

    // Push the 5 new fields into the attendance log
    user.attendanceLog.push({
      eventId: event._id,
      eventTitle: event.title,
      eventHost: event.host,
      dateScanned: new Date(),
      pointsEarned: event.points,
      motivation,
      commChannel,
      funActivity,
      umuziMetaphor,
      lookingForward
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

const isAdmin = (req, res, next) => {
  const allowedEmails = [
    "rantshothabisomail@gmail.com",
    "alanwattscodes@gmail.com",
  ];
  const userEmail =
    req.session.email || req.session.user?.email || req.user?.email;

  if (
    req.session.user &&
    userEmail &&
    allowedEmails.includes(userEmail.toLowerCase())
  ) {
    next();
  } else {
    res.status(403).send(errorMessages.notAdmin);
  }
};

const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  const allowedAdminEmails = [process.env.ADMIN_EMAIL_1, process.env.ADMIN_EMAIL_2, process.env.ADMIN_EMAIL_3].filter(Boolean);
  try {
    if (allowedAdminEmails.includes(email) && password === process.env.ADMIN_PASSWORD) {
      return res.json({ success: true });
    } else {
      return res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Error during admin login:", err);
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));