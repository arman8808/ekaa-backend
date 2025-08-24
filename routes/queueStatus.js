const express = require('express');
const router = express.Router();
const { emailQueue } = require('../utils/emailQueue');

// Get queue status
router.get('/status', async (req, res) => {
  try {
    const status = emailQueue.getStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get queue status',
      error: error.message
    });
  }
});

// Test email sending directly (for debugging)
router.post('/test-email', async (req, res) => {
  try {
    const { sendRegistrationEmail } = require('../utils/mailer');
    
    // Test data
    const testData = {
      event: {
        eventName: "Test Event",
        startDate: new Date(),
        endDate: new Date(),
        location: "Test Location",
        organiser: "Test Organizer",
        organizerEmail: "test@example.com",
        price: "$50",
        paymentLink: "https://example.com/pay"
      },
      program: {
        title: "Test Program",
        subtitle: "Test Subtitle",
        duration: "2 hours"
      },
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      mobileNo: "1234567890",
      levelName: "Test Level"
    };

    const result = await sendRegistrationEmail(testData);
    
    res.json({
      success: true,
      message: 'Test email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Test email failed:', error);
    res.status(500).json({
      success: false,
      message: 'Test email failed',
      error: error.message,
      stack: error.stack
    });
  }
});

// Get queue details
router.get('/details', async (req, res) => {
  try {
    const status = emailQueue.getStatus();
    const failedJobs = emailQueue.getFailedJobs();
    
    res.json({
      success: true,
      data: {
        ...status,
        failedJobs: failedJobs.length,
        queueInfo: {
          maxRetries: emailQueue.maxRetries,
          retryDelay: emailQueue.retryDelay,
          concurrency: emailQueue.concurrency,
          processing: emailQueue.processing
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get queue details',
      error: error.message
    });
  }
});

// Clear queue
router.post('/clear', async (req, res) => {
  try {
    emailQueue.clear();
    
    res.json({
      success: true,
      message: 'Queue cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear queue',
      error: error.message
    });
  }
});

// Stop/Start queue
router.post('/toggle', async (req, res) => {
  try {
    if (emailQueue.processing) {
      emailQueue.stop();
      res.json({
        success: true,
        message: 'Queue stopped successfully'
      });
    } else {
      emailQueue.start();
      res.json({
        success: true,
        message: 'Queue started successfully'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle queue',
      error: error.message
    });
  }
});

module.exports = router;
