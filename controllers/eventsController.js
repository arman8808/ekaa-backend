const FamilyEvent = require("../models/familyEvent");
const HypnotherapyProgram = require("../models/HypnotherapyProgram");
const DecodeProgram = require("../models/decodeProgram");

// Get all open events (future dates only)
exports.getOpenEvents = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day

    console.log('Today:', today);

    // 1. Get Family Events (using new schema with startDate/endDate)
    const familyEvents = await FamilyEvent.find({
      status: "Open",
      endDate: { $gte: today }, // Events that end today or later
    }).sort({ startDate: 1 }); // Sort by start date ascending

    console.log('Family Events found:', familyEvents.length);

    // 2. Get Hypnotherapy Events
    const hypnoPrograms = await HypnotherapyProgram.find({ status: "Open" });
    console.log('Hypnotherapy Programs found:', hypnoPrograms.length);
    
    const validHypnoEvents = hypnoPrograms.flatMap((program) => {
      console.log(`Program: ${program.title}, Events count: ${program.upcomingEvents ? program.upcomingEvents.length : 0}`);
      
      if (!program.upcomingEvents || program.upcomingEvents.length === 0) {
        return [];
      }
      
      return program.upcomingEvents
        .filter((event) => {
          // Filter events that start today or later, OR are currently happening
          if (!event.startDate || !event.endDate) {
            console.log(`Event ${event.eventName} has missing startDate or endDate`);
            return false;
          }
          
          const eventStartDate = new Date(event.startDate);
          const eventEndDate = new Date(event.endDate);
          
          // Event is valid if:
          // 1. It starts today or later (upcoming), OR
          // 2. It started before today but ends today or later (currently happening)
          const isUpcoming = eventStartDate >= today;
          const isCurrentlyHappening = eventStartDate <= today && eventEndDate >= today;
          const isValid = isUpcoming || isCurrentlyHappening;
          
          console.log(`Event ${event.eventName}: startDate=${event.startDate}, endDate=${event.endDate}, isUpcoming=${isUpcoming}, isCurrentlyHappening=${isCurrentlyHappening}, isValid=${isValid}`);
          return isValid;
        })
        .map((event) => ({
          ...event.toObject(),
          programTitle: program.title,
          programType: "hypnotherapy",
          // For consistent response format
          event: event.eventName,
          organisedby: event.organiser,
          // Calculate duration in hours for display
          duration: Math.round(
            (new Date(event.endDate) - new Date(event.startDate)) /
              (1000 * 60 * 60)
          ),
        }));
    });

    console.log('Valid Hypnotherapy Events:', validHypnoEvents.length);

    // 3. Get Decode Events
    const decodePrograms = await DecodeProgram.find({ status: "Open" });
    console.log('Decode Programs found:', decodePrograms.length);
    
    const validDecodeEvents = decodePrograms.flatMap((program) => {
      if (!program.upcomingEvents || program.upcomingEvents.length === 0) {
        return [];
      }
      
      return program.upcomingEvents
        .filter((event) => {
          // Filter events that start today or later, OR are currently happening
          if (!event.startDate || !event.endDate) {
            return false;
          }
          
          const eventStartDate = new Date(event.startDate);
          const eventEndDate = new Date(event.endDate);
          
          // Event is valid if:
          // 1. It starts today or later (upcoming), OR
          // 2. It started before today but ends today or later (currently happening)
          const isUpcoming = eventStartDate >= today;
          const isCurrentlyHappening = eventStartDate <= today && eventEndDate >= today;
          return isUpcoming || isCurrentlyHappening;
        })
        .map((event) => ({
          ...event.toObject(),
          programTitle: program.title,
          programType: "decode",
          // For consistent response format
          event: event.eventName,
          organisedby: event.organiser,
          // Calculate duration in hours for display
          duration: Math.round(
            (new Date(event.endDate) - new Date(event.startDate)) /
              (1000 * 60 * 60)
          ),
        }));
    });

    console.log('Valid Decode Events:', validDecodeEvents.length);

    // Combine all events
    const allEvents = [
      ...familyEvents.map((event) => ({
        ...event.toObject(),
        programType: "family",
        // Calculate duration in hours for display
        duration: Math.round(
          (new Date(event.endDate) - new Date(event.startDate)) /
            (1000 * 60 * 60)
        ),
      })),
      ...validHypnoEvents,
      ...validDecodeEvents,
    ];

    console.log('Total combined events:', allEvents.length);

    // Sort all events by start date (ascending)
    allEvents.sort((a, b) => {
      return new Date(a.startDate) - new Date(b.startDate);
    });

    // Format dates consistently for response
    const formattedEvents = allEvents.map((event) => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      return {
        ...event,
        // Format dates for display
        formattedStartDate: startDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        formattedStartTime: startDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        formattedEndTime: endDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        // For backward compatibility with old date field
        date: startDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };
    });

    console.log('Final formatted events:', formattedEvents.length);
    res.json(formattedEvents);
  } catch (error) {
    console.error("Error fetching open events:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
