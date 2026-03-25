const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  answer: { type: mongoose.Schema.Types.Mixed, required: true }
});

const feedbackResponseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeedbackForm', required: true },
  user: {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true }
  },
  answers: [answerSchema],
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("FeedbackResponse", feedbackResponseSchema);