const ICHRegistration = require("../models/ICH.Registartion.modal");
const HypnotherapyProgram = require("../models/HypnotherapyProgram");
const mongoose = require("mongoose");
const {
  sendICHUserConfirmation,
  sendICHAdminNotification,
} = require("../utils/mailer");
const DOCTOR_EMAIL_MAP = {
  "Dr Aiyasawmy's A/C": "Aiyasawmy@gmail.com",
  "Dr Manoj's A/C": "docbhardwaj@gmail.com",
  "Dr. Sonia Gupte": "Sonia@enso-nia.com",
};
exports.submitICHRegistration = async (req, res) => {
  try {
    console.log("Received body:", req.body);
    
    // Extract program and event information from request body
    const { programId, upcomingEventId } = req.body;

    console.log("Extracted IDs:", { programId, upcomingEventId });

    // Check if both IDs are provided
    if (!programId) {
      return res.status(404).json({
        success: false,
        message: "programId is required for registration",
        error: "Missing programId",
      });
    }

    if (!upcomingEventId) {
      return res.status(404).json({
        success: false,
        message: "upcomingEventId is required for registration",
        error: "Missing upcomingEventId",
      });
    }

    // Clean the data to remove duplicates and unnecessary fields
    const cleanBody = { ...req.body };
    delete cleanBody.level; // Remove duplicate level field
    
    const registrationData = {
      ...cleanBody,
      programId: programId,
      upcomingEventId: upcomingEventId,
    };

    console.log("Registration data:", registrationData);

    // Validate that the program exists and contains the specified event
    try {
      console.log("Converting IDs to ObjectId...");
      
      // Validate ObjectId format first
      if (!mongoose.Types.ObjectId.isValid(programId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid programId format",
          error: "Invalid ObjectId format for programId",
          receivedId: programId
        });
      }
      
      if (!mongoose.Types.ObjectId.isValid(upcomingEventId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid upcomingEventId format",
          error: "Invalid ObjectId format for upcomingEventId",
          receivedId: upcomingEventId
        });
      }
      
      // Convert strings to ObjectIds
      const programObjectId = new mongoose.Types.ObjectId(programId);
      const eventObjectId = new mongoose.Types.ObjectId(upcomingEventId);
      
      console.log("Converted ObjectIds:", { programObjectId, eventObjectId });

      const program = await HypnotherapyProgram.findById(programObjectId);
      if (!program) {
        return res.status(404).json({
          success: false,
          message: "Program not found with the provided programId",
          error: "Invalid programId",
        });
      }

      // Check if the event exists within the program
      const eventExists = program.upcomingEvents.some(
        (event) => event._id.toString() === upcomingEventId
      );

      if (!eventExists) {
        return res.status(404).json({
          success: false,
          message: "Event not found within the specified program",
          error: "Invalid upcomingEventId",
        });
      }

      // Update registrationData with the converted ObjectIds
      registrationData.programId = programObjectId;
      registrationData.upcomingEventId = eventObjectId;
    } catch (error) {
      console.log("Error validating IDs:", error);
      
      // Check if it's an ObjectId conversion error
      if (error.message && error.message.includes("does not match the accepted types")) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format provided. Please check programId and upcomingEventId.",
          error: "Invalid ObjectId format",
          receivedIds: { programId, upcomingEventId }
        });
      }
      
      return res.status(400).json({
        success: false,
        message: "Invalid ID format provided",
        error: "Invalid ID format",
        receivedIds: { programId, upcomingEventId }
      });
    }

    // Create ICH registration document
    const ichRegistration = new ICHRegistration(registrationData);

    // Save to database
    await ichRegistration.save();

    // Send confirmation emails
    try {
      // Fetch program and event details for email
      const program = await HypnotherapyProgram.findById(ichRegistration.programId);
      if (program) {
        const event = program.upcomingEvents.find(e => 
          e._id.toString() === ichRegistration.upcomingEventId.toString()
        );
        
        if (event) {
          // Prepare enhanced data for emails
          const enhancedData = {
            ...ichRegistration.toObject(),
            program: {
              title: program.title,
              subtitle: program.subtitle,
              duration: program.duration
            },
            event: {
              eventName: event.eventName,
              startDate: event.startDate,
              endDate: event.endDate,
              location: event.location,
              organiser: event.organiser,
              price: event.price,
              paymentLink: event.paymentLink
            }
          };

          // Send admin notification email with organizer email in CC
          await sendICHAdminNotification({
            userEmail: req.body.email,
            userName: `${req.body.firstName} ${req.body.lastName}`,
            registrationId: ichRegistration._id,
            city: req.body.city,
            organizerEmail: event.organizerEmail, // Use dynamic organizer email from event
            eventDetails: event
          });
          console.log('Admin notification email sent successfully');

          // Send user confirmation email
          await sendICHUserConfirmation({
            email: req.body.email,
            name: `${req.body.firstName} ${req.body.lastName}`,
            registration: enhancedData, // Pass the enhanced data with payment link
            paymentLink: event.paymentLink, // Pass payment link separately for the template
          });
          console.log('User confirmation email sent successfully');
        }
      }
    } catch (error) {
      console.error('Failed to send emails:', error);
      // Don't fail the registration if emails fail
    }

    res.status(201).json({
      success: true,
      message: "Hypnotherapy Registration submitted successfully!",
      data: {
        id: ichRegistration._id,
        userEmailSent: true,
        adminEmailSent: true,
      },
    });
  } catch (error) {
    console.error("ICH Registration error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit ICH registration",
    });
  }
};
// Get all ICH registrations with pagination
exports.getAllICHRegistrations = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sorting parameters
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Search filter
    const search = req.query.search || "";
    const searchRegex = new RegExp(search, "i");

    // Build filter
    const filter = {
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { mobileNo: searchRegex },
        { city: searchRegex },
      ],
    };

    // Get total count
    const total = await ICHRegistration.countDocuments(filter);

    // Get paginated registrations
    const registrations = await ICHRegistration.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("-__v"); // Exclude version key

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    // Determine next and previous pages
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    res.status(200).json({
      success: true,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        nextPage,
        prevPage,
        limit,
      },
      data: registrations,
    });
  } catch (error) {
    console.error("Get all Hypnotherapy registrations error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch Hypnotherapy registrations",
    });
  }
};

// Get a single ICH registration by ID
exports.getOneICHRegistration = async (req, res) => {
  try {
    const registration = await ICHRegistration.findById(req.params.id).select(
      "-__v"
    ); // Exclude version key

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Hypnotherapy registration not found",
      });
    }

    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    console.error("Get Hypnotherapy  registration error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid registration ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch Hypnotherapy  registration",
    });
  }
};
exports.downloadICHRegistrationsCSV = async (req, res) => {
  try {
    console.log("from ib=nside download");
    // Date filter parameters
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : null;
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
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { mobileNo: searchRegex },
        { city: searchRegex },
      ];
    }

    // Get all registrations matching the filter
    const registrations = await ICHRegistration.find(filter)
      .sort({ createdAt: -1 }) // Sort by newest first
      .select("-__v"); // Exclude version key

    if (registrations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No registrations found matching the criteria",
      });
    }

    // Define CSV headers
    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Mobile No",
      "Gender",
      "Date of Birth",
      "Address",
      "City",
      "State",
      "Country",
      "Postal Code",
      "Registration Date",
      "Status",
    ];

    // Convert registrations to CSV rows
    const rows = registrations.map((reg) => [
      reg._id,
      `"${reg.firstName}"`,
      `"${reg.lastName}"`,
      `"${reg.email}"`,
      `"${reg.mobileNo}"`,
      `"${reg.gender}"`,
      `"${reg.dateOfBirth}"`,
      `"${reg.address}"`,
      `"${reg.city}"`,
      `"${reg.state}"`,
      `"${reg.country}"`,
      `"${reg.postalCode}"`,
      `"${reg.createdAt.toISOString()}"`,
      `"${reg.status || "pending"}"`,
    ]);

    // Combine headers and rows
    const csvData = [headers, ...rows].map((row) => row.join(",")).join("\n");

    // Set response headers for CSV download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=ich_registrations.csv"
    );

    // Send the CSV data
    res.status(200).send(csvData);
  } catch (error) {
    console.error("Download Hypnotherapy registrations CSV error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate CSV export",
    });
  }
};
// Delete a single ICH registration by ID
exports.deleteICHRegistration = async (req, res) => {
  try {
    const registration = await ICHRegistration.findByIdAndDelete(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Hypnotherapy registration not found",
      });
    }

  
    res.status(200).json({
      success: true,
      message: "Hypnotherapy registration deleted successfully",
      data: {
        id: registration._id,
        name: `${registration.firstName} ${registration.lastName}`,
        email: registration.email,
      },
    });
  } catch (error) {
    console.error("Delete Hypnotherapy registration error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid registration ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete Hypnotherapy registration",
    });
  }
};
