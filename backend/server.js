require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Models
const Event = require('./models/Event');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const allowedOrigins = [
  'http://localhost:5173',                  // Your local frontend
  'https://your-frontend-app.up.railway.app' // Your future deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// --- ROUTES ---

// 1. ADMIN: Create Event
// Updated to include 'host' and 'description'
app.post('/api/events', async (req, res) => {
  try {
    const { title, description, host, eventType, durationMinutes } = req.body;

    // Auto-allocate points based on type
    const pointsMap = { 'short_online': 5, 'long_online': 10, 'in_person': 15 };
    const points = pointsMap[eventType];

    // Create new event with detailed fields
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

// 2. ADMIN: Get All Data (Events & Users)
// Fetches data for the dashboard leaderboard and event list
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

// 3. USER: Validate Event QR Code
// Checks if the event exists and is still within its duration
app.get('/api/events/:id/validate', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ valid: false, message: "Event not found" });

    if (!event.isLive()) {
      return res.status(400).json({ valid: false, message: "This QR Code has expired." });
    }

    // Return basic info for the confirmation screen
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

// 4. USER: Submit Attendance
// Updated to track detailed attendance history (logs)
app.post('/api/attend', async (req, res) => {
  const { eventId, name, surname, email } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event || !event.isLive()) {
      return res.status(400).json({ error: "Event expired or invalid" });
    }

    // Find user by email or create a new one
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, surname, email });
    }

    // Check for duplicate attendance using the new attendanceLog
    // We check if ANY entry in the log matches this event ID
    const alreadyAttended = user.attendanceLog.some(
      (log) => log.eventId.toString() === eventId
    );

    if (alreadyAttended) {
      return res.status(400).json({ error: "You have already scanned in for this event." });
    }

    // Add detailed log entry
    user.attendanceLog.push({
      eventId: event._id,
      eventTitle: event.title,
      eventHost: event.host,
      dateScanned: new Date(),
      pointsEarned: event.points
    });

    // Update total points and personal details (in case they changed)
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

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));