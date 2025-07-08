const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, required: true, trim: true },
    nameAsCertificate: { type: String, required: true, trim: true },
    currentAddress: { type: String, required: true, trim: true },
    permanenetAddress: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    timeslot: { type: String },
    TelNo: { type: String, trim: true },
    mobileNo: { type: String, required: true, trim: true },
    office: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    dob: { type: Date, required: true },
    occupation: { type: String, required: true, trim: true },
    courseDetailDate: { type: Date },
    courseDetailTime: { type: String },
    courseDetailVenue: { type: String },
    hearAbout: { type: String, trim: true },
    communicationPreferences: { type: Boolean, required: true },
    termsandcondition: { type: Boolean, required: true },
    idPhotofront: { type: String, required: true },
    idphotoback: { type: String },
    profileImage: { type: String, required: true },
    levelName: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Registration = mongoose.model("Registration", registrationSchema);

module.exports = Registration;
