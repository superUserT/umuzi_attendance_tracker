require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const Event = require("./models/Event");
const User = require("./models/User");
const Admin = require("./models/Admin");
const FeedbackForm = require("./models/FeedbackForm");
const FeedbackResponse = require("./models/FeedbackResponse");
const { loginUser, registerUser, protect, admin } = require("./auth");
const logger = require("./config/logger");

const app = express();

app.use(express.json());

const allowedOrigins = ["http://localhost:5173", process.env.FRONTEND_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  }),
);

const initializeAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      logger.warn("ADMIN_EMAIL or ADMIN_PASSWORD not set in .env");
      return;
    }

    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const newAdmin = new Admin({
      name: "Admin",
      surname: "User",
      email: adminEmail,
      password: hashedPassword,
      role: "admin"
    });

    await newAdmin.save();
    console.log("Admin user initialized successfully");
  } catch (err) {
    logger.error("Error initializing admin:", err);
  }
};

mongoose
  .connect(process.env.MONGO_URL)
  .then(async () => {
    console.log("MongoDB Connected");
    await initializeAdmin();
  })
  .catch((err) => logger.error("MongoDB Connection Error:", err));

app.post("/api/events", protect, admin, async (req, res) => {
  try {
    const { title, description, host, eventType, durationMinutes } = req.body;

    const pointsMap = { short_online: 5, long_online: 10, in_person: 15 };
    const points = pointsMap[eventType];

    const newEvent = new Event({
      title,
      description,
      host,
      eventType,
      points,
      durationMinutes,
    });

    await newEvent.save();
    res.json(newEvent);
  } catch (err) {
    logger.error("Error creating event:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/data", protect, admin, async (req, res) => {
  try {
    const events = await Event.find().sort({ startTime: -1 });
    const users = await User.find().sort({ totalPoints: -1 });
    res.json({ events, users });
  } catch (err) {
    logger.error("Error fetching admin data:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/events/:id/validate", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event)
      return res.status(404).json({ valid: false, message: "Event not found" });

    if (!event.isLive()) {
      return res
        .status(400)
        .json({ valid: false, message: "This QR Code has expired." });
    }

    res.json({
      valid: true,
      eventTitle: event.title,
      host: event.host,
      description: event.description,
      points: event.points,
    });
  } catch (err) {
    logger.error("Error validating event:", err);
    res.status(500).json({ valid: false });
  }
});

app.post("/api/attend", async (req, res) => {
  // Added the 5 new fields to the destructuring
  const {
    eventId,
    name,
    surname,
    email,
    motivation,
    commChannel,
    funActivity,
    umuziMetaphor,
    lookingForward,
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
      (log) => log.eventId.toString() === eventId,
    );

    if (alreadyAttended) {
      return res
        .status(400)
        .json({ error: "You have already scanned in for this event." });
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
      lookingForward,
    });

    user.totalPoints += event.points;
    user.name = name;
    user.surname = surname;

    await user.save();

    res.json({
      success: true,
      pointsAdded: event.points,
      totalPoints: user.totalPoints,
    });
  } catch (err) {
    logger.error("Error submitting attendance:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- FEEDBACK FORM ROUTES ---

// Create a new Feedback Form (Admin)
app.post("/api/feedback", protect, admin, async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    const newForm = new FeedbackForm({ title, description, questions });
    await newForm.save();
    res.json(newForm);
  } catch (err) {
    logger.error("Error creating feedback form:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all Feedback Forms (Admin Dashboard)
app.get("/api/admin/feedback", protect, admin, async (req, res) => {
  try {
    const forms = await FeedbackForm.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    logger.error("Error fetching feedback forms:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get single Feedback Form for Users (Public - Via QR scan)
app.get("/api/feedback/:id/validate", async (req, res) => {
  try {
    const form = await FeedbackForm.findById(req.params.id);
    if (!form) return res.status(404).json({ valid: false, message: "Feedback form not found" });
    res.json({ valid: true, form });
  } catch (err) {
    logger.error("Error validating feedback form:", err);
    res.status(500).json({ valid: false });
  }
});

// Submit Feedback Response (Public)
app.post("/api/feedback/:id/respond", async (req, res) => {
  try {
    const { name, surname, email, answers } = req.body;
    const formId = req.params.id;

    const newResponse = new FeedbackResponse({ formId, user: { name, surname, email }, answers });
    await newResponse.save();
    
    res.json({ success: true });
  } catch (err) {
    logger.error("Error submitting feedback:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get responses for a specific form (Admin - Leaderboard/Export)
app.get("/api/admin/feedback/:id/responses", protect, admin, async (req, res) => {
  try {
    const responses = await FeedbackResponse.find({ formId: req.params.id }).sort({ submittedAt: -1 });
    res.json(responses);
  } catch (err) {
    logger.error("Error fetching responses:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/login", loginUser);

app.post("/api/register", registerUser);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
