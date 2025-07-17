const familyConsitalionRegistration = require("../models/family.consitalation.registration.modal");
const { sendRegistrationEmails } = require("../utils/mailer");
// const { sendRegistrationEmails } = require('../services/emailService');

// Doctor email mapping
const DOCTOR_EMAIL_MAP = {
  "Dr Aiyasawmy's": "Aiyasawmy@gmail.com",
  "Dr Manoj's": "docbhardwaj@gmail.com",
  "Dr. Sonia Gupte's": "Sonia@enso-nia.com",
};


exports.createRegistration = async (req, res) => {
  try {
    const { session, fullName, email, phone } = req.body;

    const doctorEmail =
      DOCTOR_EMAIL_MAP[session.organisedby] || "default@example.com";

    const registrationData = {
      sessionId: session.id,
      event: session.Event,
      date: session.Date,
      location: session.Location,
      organisedBy: session.organisedby,
      organiserEmail: session.organiserEmail,
      fullName,
      email,
      phone,
    };

    // Save to database
    const newRegistration = new familyConsitalionRegistration(registrationData);
    await newRegistration.save();
   const emailData = {
      ...registrationData,
      _id: newRegistration._id
    };

    // Send emails
    const emailSent = await sendRegistrationEmails(emailData);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Registration saved but email sending failed'
      });
    }
    res.status(201).json({
      success: true,
      message: "Registration successful!",
      registration: newRegistration,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

exports.getAllRegistrations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { event: { $regex: search, $options: "i" } },
            { organisedBy: { $regex: search, $options: "i" } },
            { organiserEmail: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const registrations = await familyConsitalionRegistration
      .find(searchQuery)
      .sort({ createdAt: -1 }) // Always show newest first
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await familyConsitalionRegistration.countDocuments(
      searchQuery
    );

    res.status(200).json({
      success: true,
      data: registrations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRegistrations: total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch registrations",
      error: error.message,
    });
  }
};

exports.getRegistrationById = async (req, res) => {
  try {
    const registration = await familyConsitalionRegistration.findById(
      req.params.id
    );
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }
    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch registration",
      error: error.message,
    });
  }
};
