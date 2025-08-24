const { sendRegistrationEmail, sendUserConfirmationEmail } = require('./mailer');
const DecodeProgram = require('../models/decodeProgram');
const { addEmailToQueue } = require('./emailQueue');

// Enhanced email service that fetches program and event details
class EnhancedMailer {
  
  // Send admin notification email with program and event details
  static async sendAdminNotificationEmail(registrationData) {
    try {
      // Fetch program and event details
      const program = await DecodeProgram.findById(registrationData.programId);
      if (!program) {
        throw new Error('Program not found');
      }

      // Find the specific event
      const event = program.upcomingEvents.find(e => 
        e._id.toString() === registrationData.upcomingEventId.toString()
      );
      
      if (!event) {
        throw new Error('Event not found');
      }

              // Prepare enhanced data for admin email
        const enhancedData = {
          ...registrationData,
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
            price: event.price
          }
        };

      // Add to email queue
      await addEmailToQueue('adminNotification', enhancedData, {
        priority: 1, // High priority for admin notifications
        delay: 0
      });

      console.log('Admin notification email queued successfully');
      return true;
    } catch (error) {
      console.error('Failed to queue admin notification email:', error);
      throw error;
    }
  }

  // Send user confirmation email with payment details
  static async sendUserConfirmationEmail(registrationData) {
    try {
      // Fetch program and event details
      const program = await DecodeProgram.findById(registrationData.programId);
      if (!program) {
        throw new Error('Program not found');
      }

      // Find the specific event
      const event = program.upcomingEvents.find(e => 
        e._id.toString() === registrationData.upcomingEventId.toString()
      );
      
      if (!event) {
        throw new Error('Event not found');
      }

              // Prepare enhanced data for user email
        const enhancedData = {
          ...registrationData,
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

      // Add to email queue
      await addEmailToQueue('userConfirmation', enhancedData, {
        priority: 2, // Medium priority for user confirmations
        delay: 1000 // 1 second delay
      });

      console.log('User confirmation email queued successfully');
      return true;
    } catch (error) {
      console.error('Failed to queue user confirmation email:', error);
      throw error;
    }
  }

  // Send both emails for a registration
  static async sendRegistrationEmails(registrationData) {
    try {
      // Queue both emails
      await Promise.all([
        this.sendAdminNotificationEmail(registrationData),
        this.sendUserConfirmationEmail(registrationData)
      ]);

      console.log('All registration emails queued successfully');
      return true;
    } catch (error) {
      console.error('Failed to queue registration emails:', error);
      throw error;
    }
  }
}

module.exports = EnhancedMailer;
