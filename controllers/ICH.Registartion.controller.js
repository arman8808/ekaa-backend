const ICHRegistration = require("../models/ICH.Registartion.modal");
const {
  sendICHUserConfirmation,
  sendICHAdminNotification,
} = require("../utils/mailer");
// const { sendICHUserConfirmation, sendICHAdminNotification } = require('../services/ichEmailService');
const DOCTOR_EMAIL_MAP = {
  "Dr Aiyasawmy's A/C": "Aiyasawmy@gmail.com",
  "Dr Manoj's A/C": "docbhardwaj@gmail.com",
  "Dr. Sonia Gupte": "Sonia@enso-nia.com",
};
exports.submitICHRegistration = async (req, res) => {
  try {
    // Extract file paths
    const files = {
      profileImage: req.files?.profileImage?.[0]?.path,
      idPhotofront: req.files?.frontImage?.[0]?.path,
      idphotoback: req.files?.backImage?.[0]?.path,
    };
    console.log(files);

    // Create ICH registration document
    const ichRegistration = new ICHRegistration({
      ...req.body,
      ...files,
    });

    // Save to database
    await ichRegistration.save();

    // Send confirmation emails
    await sendICHUserConfirmation({
      email: req.body.email,
      name: `${req.body.firstName} ${req.body.lastName}`,
      registration: ichRegistration, // Pass the full registration object
    });

    await sendICHAdminNotification({
      userEmail: req.body.email,
      userName: `${req.body.firstName} ${req.body.lastName}`,
      registrationId: ichRegistration._id,
      city: req.body.city,
    });

    res.status(201).json({
      success: true,
      message: "ICH Registration submitted successfully!",
      data: {
        id: ichRegistration._id,
        userEmailSent: true,
        adminEmailSent: true,
      },
    });
  } catch (error) {
    console.error("ICH Registration error:", error);

    // Handle Multer errors
    if (error.name === "MulterError") {
      return res.status(400).json({
        success: false,
        message: `File upload error: ${error.message}`,
      });
    }

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
    console.error("Get all ICH registrations error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch ICH registrations",
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
        message: "ICH registration not found",
      });
    }

    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    console.error("Get ICH registration error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid registration ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch ICH registration",
    });
  }
};
