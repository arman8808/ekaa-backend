const Registration = require("../models/Registration");
const DecodeProgram = require("../models/decodeProgram");
const mongoose = require("mongoose");
const { sendRegistrationEmail, sendUserConfirmationEmail } = require("../utils/mailer");
const EVENT_DOCTOR_MAP = {
  "Decode The Child": "Dr Aiyasawmy's A/C",
  "L 1": "Dr. Sonia Gupte",
};
const PAYMENT_LINK_MAP = {
  // "Dr Manoj's A/C": "https://buy.stripe.com/xxxx_for_manoj",
  "Dr Aiyasawmy's A/C": "https://buy.stripe.com/6oU6ozgGsc45cfCgYj93y02",
  "Dr. Sonia Gupte": "https://buy.stripe.com/14A3cxdvCbBn8qU32O7Vm0z",
};

exports.createRegistration = async (req, res) => {
  try {
    // Extract program and event information from request body
    const { programId, upcomingEventId } = req.body;

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

    const registrationData = {
      ...req.body,
      programId: programId,
      upcomingEventId: upcomingEventId,
    };

    // Validate that the program exists and contains the specified event
    try {
      // Convert strings to ObjectIds
      const programObjectId = new mongoose.Types.ObjectId(programId);
      const eventObjectId = new mongoose.Types.ObjectId(upcomingEventId);

      const program = await DecodeProgram.findById(programObjectId);
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
      return res.status(400).json({
        success: false,
        message: "Invalid ID format provided",
        error: "Invalid ID format",
      });
    }

    const registration = new Registration(registrationData);
    await registration.save();

    // Send emails directly
    try {
      // Fetch program and event details for email
      const program = await DecodeProgram.findById(registration.programId);
      if (program) {
        const event = program.upcomingEvents.find(e => 
          e._id.toString() === registration.upcomingEventId.toString()
        );
        
        if (event) {
          // Prepare enhanced data for emails
          const enhancedData = {
            ...registration.toObject(),
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
              organizerEmail: event.organizerEmail,
              price: event.price,
              paymentLink: event.paymentLink
            }
          };

          // Send admin notification email
          await sendRegistrationEmail(enhancedData);
          console.log('Admin notification email sent successfully');

          // Send user confirmation email
          await sendUserConfirmationEmail(enhancedData);
          console.log('User confirmation email sent successfully');
        }
      }
    } catch (error) {
      console.error('Failed to send emails:', error);
      // Don't fail the registration if emails fail
    }
    res.status(201).json({
      success: true,
      message: "Registration successful!",
      data: registration,
    });
  } catch (error) {
    console.log(error);

    res.status(400).json({
      success: false,
      message: "Registration failed. Please check your input and try again.",
      error: error.message,
    });
  }
};

exports.getRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("programId", "title subtitle")
      .populate(
        "upcomingEventId",
        "eventName startDate endDate location organiser organizerEmail price"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Registrations fetched successfully.",
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch registrations.",
      error: error.message,
    });
  }
};

// Get registrations by upcoming event ID
exports.getRegistrationsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const registrations = await Registration.find({ upcomingEventId: eventId })
      .populate("upcomingEventId", "title subtitle upcomingEvents")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Registrations fetched successfully for the event.",
      data: registrations,
      eventId: eventId,
      totalRegistrations: registrations.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch registrations for the event.",
      error: error.message,
    });
  }
};
