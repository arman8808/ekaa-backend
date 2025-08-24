const mongoose = require("mongoose");

const familyConsitalionRegistrationSchema = new mongoose.Schema({
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyEvent',
    required: [true, "Program ID is required"],
  },
  sessionId: {
    type: String,
    required: true,
  },
  event: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  organisedBy: {
    type: String,
    required: true,
  },
  organiserEmail: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  termsAndCondition: {
    type: Boolean,
    required: [true, "Terms and conditions acceptance is required"],
    default: false,
  },
  communicationPreferences: {
    type: Boolean,
    required: [true, "Communication preferences selection is required"],
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "familyConsitalionRegistration",
  familyConsitalionRegistrationSchema
);
