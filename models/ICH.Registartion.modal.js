const mongoose = require("mongoose");

const ichRegistrationSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: String,
    lastName: { type: String, required: true },
    nameAsCertificate: { type: String, required: true },
    currentAddress: { type: String, required: true },
    permanenetAddress: { type: String, required: true },
    city: { type: String, required: true },
    venue: { type: String },
    timeslot: { type: String },
    TelNo: String,
    mobileNo: { type: String, required: true },
    email: { type: String, required: true },
    dob: { type: Date, required: true },
    occupation: { type: String, required: true },
    courseDetailDate: Date,
    courseDetailTime: String,
    courseDetailVenue: String,
    hearAbout: String,
    communicationPreferences: Boolean,
    termsandcondition: { type: Boolean, required: true },
    isSameAddress: Boolean,
    levelName: String,
    level: String,
    // Remove file upload fields since we're not using them
    // profileImage: String,
    // idPhotofront: { type: String, required: false },
    // idphotoback: String,
    // Add program and event reference fields
    programId: { type: mongoose.Schema.Types.ObjectId, ref: 'HypnotherapyProgram', required: true },
    upcomingEventId: { type: mongoose.Schema.Types.ObjectId, ref: 'HypnotherapyProgram', required: true },
  },
  {
    timestamps: true,
    collection: "ich_registrations", // Explicit collection name
  }
);

module.exports = mongoose.model("ICHRegistration", ichRegistrationSchema);
