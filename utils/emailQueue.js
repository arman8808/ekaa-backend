const EventEmitter = require('events');

// Simple in-memory email queue
class EmailQueue extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
    this.processing = false;
    this.maxRetries = 3;
    this.retryDelay = 2000;
    this.concurrency = 3;
    this.activeJobs = 0;
    
    // Start processing
    this.start();
  }

  // Add email to queue
  async addEmail(type, data, options = {}) {
    const job = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      type,
      data,
      priority: options.priority || 0,
      delay: options.delay || 0,
      attempts: 0,
      maxAttempts: options.maxAttempts || this.maxRetries,
      createdAt: new Date(),
      ...options
    };

    // Add to queue based on priority
    if (job.priority === 0) {
      this.queue.push(job);
    } else {
      this.queue.unshift(job);
    }

    console.log(`📧 Email job added to queue: ${type}, Job ID: ${job.id}`);
    this.emit('jobAdded', job);
    
    return job;
  }

  // Start processing queue
  start() {
    if (this.processing) return;
    this.processing = true;
    this.processQueue();
  }

  // Process queue
  async processQueue() {
    while (this.queue.length > 0 && this.activeJobs < this.concurrency) {
      const job = this.queue.shift();
      
      if (job.delay > 0) {
        // Add back to queue with delay
        setTimeout(() => {
          this.queue.unshift(job);
        }, job.delay);
        continue;
      }

      this.activeJobs++;
      this.processJob(job);
    }

    // Continue processing if there are more jobs
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 100);
    }
  }

  // Process individual job
  async processJob(job) {
    try {
      console.log(`🔄 Processing email job: ${job.type}, ID: ${job.id}`);
      
      // Import mailer functions dynamically to avoid circular dependencies
      const { sendRegistrationEmail, sendUserConfirmationEmail } = require('./mailer');
      
      let result;
      switch (job.type) {
        case 'adminNotification':
          result = await sendRegistrationEmail(job.data);
          break;
        case 'userConfirmation':
          result = await sendUserConfirmationEmail(job.data);
          break;
        default:
          throw new Error(`Unknown email type: ${job.type}`);
      }

      console.log(`✅ Email sent successfully: ${job.type}, Job ID: ${job.id}`);
      this.emit('jobCompleted', job, result);
      
    } catch (error) {
      console.error(`❌ Email failed: ${job.type}, Job ID: ${job.id}`, error.message);
      
      job.attempts++;
      
      if (job.attempts < job.maxAttempts) {
        // Retry with exponential backoff
        const delay = this.retryDelay * Math.pow(2, job.attempts - 1);
        console.log(`🔄 Retrying job ${job.id} in ${delay}ms (attempt ${job.attempts}/${job.maxAttempts})`);
        
        setTimeout(() => {
          this.queue.unshift(job);
          this.activeJobs--;
          this.processQueue();
        }, delay);
        return;
      } else {
        // Job failed permanently
        console.error(`💀 Job ${job.id} failed permanently after ${job.maxAttempts} attempts`);
        this.emit('jobFailed', job, error);
      }
    }

    this.activeJobs--;
    this.processQueue();
  }

  // Get queue status
  getStatus() {
    return {
      waiting: this.queue.length,
      active: this.activeJobs,
      total: this.queue.length + this.activeJobs
    };
  }

  // Get failed jobs (stored in memory for this session)
  getFailedJobs() {
    return this.failedJobs || [];
  }

  // Clear queue
  clear() {
    this.queue = [];
    console.log('🧹 Email queue cleared');
  }

  // Stop processing
  stop() {
    this.processing = false;
    console.log('⏹️ Email queue stopped');
  }
}

// Create singleton instance
const emailQueue = new EmailQueue();

// Helper function to add email to queue
const addEmailToQueue = async (type, data, options = {}) => {
  return await emailQueue.addEmail(type, data, options);
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down email queue...');
  emailQueue.stop();
  process.exit(0);
});

module.exports = {
  emailQueue,
  addEmailToQueue
};
