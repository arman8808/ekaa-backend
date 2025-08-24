const familyConsitalionRegistration = require("../models/family.consitalation.registration.modal");
const FamilyEvent = require("../models/familyEvent");
const mongoose = require("mongoose");
const { sendRegistrationEmails } = require("../utils/mailer");
// const { sendRegistrationEmails } = require('../services/emailService');

// Doctor email mapping
const DOCTOR_EMAIL_MAP = {
  "Dr Aiyasawmy's": "Aiyasawmy@gmail.com",
  "Dr Manoj's": "docbhardwaj@gmail.com",
  "Dr. Sonia Gupte's": "Sonia@enso-nia.com",
};

// Function to generate unique 6-digit sessionId with timestamp
const generateSessionId = () => {
  const timestamp = Date.now().toString();
  const randomDigits = Math.floor(Math.random() * 900000) + 100000; // 6-digit random number
  return `${timestamp.slice(-6)}${randomDigits}`;
};


exports.createRegistration = async (req, res) => {
  try {
    console.log("Received body:", req.body);
    
    // Extract program information from request body
    const { programId, sessionId, fullName, email, phone, termsAndCondition, communicationPreferences } = req.body;

    console.log("Extracted programId:", { programId });

    // Check if programId is provided
    if (!programId) {
      return res.status(404).json({
        success: false,
        message: "programId is required for registration",
        error: "Missing programId",
      });
    }

    // Check if required boolean fields are provided
    if (termsAndCondition === undefined || termsAndCondition === null) {
      return res.status(400).json({
        success: false,
        message: "termsAndCondition is required for registration",
        error: "Missing termsAndCondition",
      });
    }

    if (communicationPreferences === undefined || communicationPreferences === null) {
      return res.status(400).json({
        success: false,
        message: "communicationPreferences is required for registration",
        error: "Missing communicationPreferences",
      });
    }

    // Validate that the program exists
    try {
      console.log("Converting programId to ObjectId...");
      
      // Validate ObjectId format first
      if (!mongoose.Types.ObjectId.isValid(programId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid programId format",
          error: "Invalid ObjectId format for programId",
          receivedId: programId
        });
      }
      
      // Convert string to ObjectId
      const programObjectId = new mongoose.Types.ObjectId(programId);
      
      console.log("Converted ObjectId:", { programObjectId });

      console.log("About to query FamilyEvent with ID:", programObjectId);
      
      let program;
      try {
        program = await FamilyEvent.findById(programObjectId);
        console.log("FamilyEvent.findById result:", program);
        
        if (!program) {
          return res.status(404).json({
            success: false,
            message: "Program not found with the provided programId",
            error: "Invalid programId",
          });
        }
      } catch (findError) {
        console.log("Error in FamilyEvent.findById:", findError);
        return res.status(500).json({
          success: false,
          message: "Database error while finding program",
          error: findError.message,
        });
      }

      console.log("Found program:", program);

      // Generate unique sessionId if not provided
      const finalSessionId = sessionId || generateSessionId();
      console.log("Generated sessionId:", finalSessionId);

      // Update registrationData with the converted ObjectId and fetch event details from FamilyEvent
      const registrationData = {
        programId: programObjectId,
        sessionId: finalSessionId,
        event: program.event,           // From FamilyEvent
        date: program.startDate ? new Date(program.startDate).toLocaleDateString() : program.date, // From FamilyEvent
        location: program.location,     // From FamilyEvent
        organisedBy: program.organisedby, // From FamilyEvent
        organiserEmail: program.organiserEmail, // From FamilyEvent
        fullName,
        email,
        phone,
        termsAndCondition,
        communicationPreferences,
      };

      console.log("Registration data:", registrationData);

      // Save to database
      const newRegistration = new familyConsitalionRegistration(registrationData);
      await newRegistration.save();

      const emailData = {
        ...registrationData,
        _id: newRegistration._id,
        paymentLink: program.paymentLink, // Add payment link from FamilyEvent
        organiserEmail: program.organiserEmail // Ensure organizer email is included
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
      console.log("Error validating IDs:", error);
      
      // Check if it's an ObjectId conversion error
      if (error.message && error.message.includes("does not match the accepted types")) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format provided. Please check programId.",
          error: "Invalid ObjectId format",
          receivedId: programId
        });
      }
      
      return res.status(400).json({
        success: false,
        message: "Invalid ID format provided",
        error: "Invalid ID format",
        receivedId: programId
      });
    }

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
      .populate("programId", "event location organisedby organiserEmail price")
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
exports.downloadRegistrationsCSV = async (req, res) => {
  try {
    // Date filter parameters
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // Build filter
    const filter = {};
    
    // Add date filter if provided
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) {
        // Include the entire end date by setting to end of day
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endOfDay;
      }
    }

    // Search filter
    const search = req.query.search || "";
    if (search) {
      filter.$or = [
        { event: { $regex: search, $options: "i" } },
        { organisedBy: { $regex: search, $options: "i" } },
        { organiserEmail: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Get all registrations matching the filter
    const registrations = await familyConsitalionRegistration.find(filter)
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    if (registrations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No registrations found matching the criteria",
      });
    }

    // Define CSV headers
    const headers = [
      'ID', 'Program ID', 'Event', 'Date', 'Location', 'Organised By', 'Organiser Email',
      'Full Name', 'Email', 'Phone', 'Terms Accepted', 'Communication Preferences', 'Registration Date'
    ];

    // Convert registrations to CSV rows
    const rows = registrations.map(reg => [
      reg._id,
      reg.programId || '',
      `"${reg.event || ''}"`,
      `"${reg.date || ''}"`,
      `"${reg.location || ''}"`,
      `"${reg.organisedBy || ''}"`,
      `"${reg.organiserEmail || ''}"`,
      `"${reg.fullName || ''}"`,
      `"${reg.email || ''}"`,
      `"${reg.phone || ''}"`,
      reg.termsAndCondition ? 'Yes' : 'No',
      reg.communicationPreferences ? 'Yes' : 'No',
      `"${reg.createdAt.toISOString()}"`
    ]);

    // Combine headers and rows
    const csvData = [headers, ...rows].map(row => row.join(',')).join('\n');

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=family_consultation_registrations.csv');
    
    // Send the CSV data
    res.status(200).send(csvData);

  } catch (error) {
    console.error("Download registrations CSV error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate CSV export",
    });
  }
};
exports.deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await familyConsitalionRegistration.findById(id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    // Delete the registration
    await familyConsitalionRegistration.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Registration deleted successfully",
      deletedRegistration: registration
    });
  } catch (error) {
    console.error("Delete registration error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete registration",
      error: error.message,
    });
  }
};