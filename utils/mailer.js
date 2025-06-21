// // const nodemailer = require('nodemailer');

// // const transporter = nodemailer.createTransport({
// //     service: 'gmail', // Or custom SMTP config
// //     auth: {
// //       user: process.env.MAIL_USER,
// //       pass: process.env.MAIL_PASS
// //     },
// //     tls: {
// //       rejectUnauthorized: false  // This line allows self-signed certificates
// //     }
// //   });

// // const sendRegistrationEmail = async (registrationData) => {
// //   const {
// //     firstName, lastName, email, mobileNo, dob, occupation, levelName
// //   } = registrationData;

// //   const mailOptions = {
// //     from: process.env.MAIL_USER,
// //     to: 'your-admin@example.com', // Replace with your email to receive alerts
// //     subject: 'New Course Registration',
// //     html: `
// //       <h2>New Registration Received</h2>
// //       <p><strong>Name:</strong> ${firstName} ${lastName}</p>
// //       <p><strong>Email:</strong> ${email}</p>
// //       <p><strong>Mobile:</strong> ${mobileNo}</p>
// //       <p><strong>Date of Birth:</strong> ${new Date(dob).toDateString()}</p>
// //       <p><strong>Occupation:</strong> ${occupation}</p>
// //       <p><strong>Registered For:</strong> ${levelName}</p>
// //     `
// //   };

// //   await transporter.sendMail(mailOptions);
// // };

// // module.exports = sendRegistrationEmail;


// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.MAIL_USER,
//       pass: process.env.MAIL_PASS
//     },
//     tls: {
//       rejectUnauthorized: false
//     }
// });

// // Admin notification email (existing function)
// const sendRegistrationEmail = async (registrationData) => {
//   const {
//     firstName, lastName, email, mobileNo, dob, occupation, levelName
//   } = registrationData;

//   const mailOptions = {
//     from: email,
//     to: process.env.MAIL_USER, // Admin email from env
//     subject: 'New Course Registration',
//     html: `
//       <h2>New Registration Received</h2>
//       <p><strong>Name:</strong> ${firstName} ${lastName}</p>
//       <p><strong>Email:</strong> ${email}</p>
//       <p><strong>Mobile:</strong> ${mobileNo}</p>
//       <p><strong>Date of Birth:</strong> ${new Date(dob).toDateString()}</p>
//       <p><strong>Occupation:</strong> ${occupation}</p>
//       <p><strong>Registered For:</strong> ${levelName}</p>
//     `
//   };

//   console.log(mailOptions)

//   await transporter.sendMail(mailOptions);
// };

// // User confirmation email (new function)
// const sendUserConfirmationEmail = async (registrationData) => {
//   const {
//     firstName, lastName, email, levelName, city, courseDetailDate, 
//     courseDetailTime, timeslot
//   } = registrationData;

//   // Format date and time
//   const formattedDate = courseDetailDate ? new Date(courseDetailDate).toDateString() : 'TBD';
//   const timeInfo = courseDetailTime || timeslot || 'TBD';

//   const mailOptions = {
//     from: process.env.MAIL_USER,
//     to: email, // User's email
//     subject: 'Registration Confirmed – Your EKAA Course Details',
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #333;">Registration Confirmed – Your EKAA Course Details</h2>
        
//         <p>Dear ${firstName},</p>
        
//         <p>Thank you for registering with EKAA.</p>
        
//         <p>We're excited to welcome you to the upcoming <strong>${levelName}</strong> in <strong>${city}</strong>.</p>
        
//         <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
//           <h3 style="color: #333; margin-top: 0;">📌 Registration Details:</h3>
//           <p><strong>Course:</strong> ${levelName}</p>
//           <p><strong>City:</strong> ${city}</p>
//           <p><strong>Date:</strong> ${formattedDate}</p>
//           <p><strong>Time:</strong> ${timeInfo}</p>
//         </div>
        
//         <div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
//           <h3 style="color: #333; margin-top: 0;">📅 What's Next:</h3>
//           <p>A representative from EKAA will be connecting with you shortly to guide you through the next steps and provide any additional details you may need.</p>
//         </div>
        
//         <p>For any queries in the meantime, feel free to contact us at <a href="mailto:connect@ekaausa.com">connect@ekaausa.com</a>.</p>
        
//         <p style="margin-top: 30px;">
//           Warm regards,<br>
//           <strong>Team EKAA</strong>
//         </p>
//       </div>
//     `
//   };

//   await transporter.sendMail(mailOptions);
// };



// module.exports = {
//   sendRegistrationEmail,
//   sendUserConfirmationEmail
// };





const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
});

// Admin notification email for registration
const sendRegistrationEmail = async (registrationData) => {
  const {
    firstName, lastName, email, mobileNo, dob, occupation, levelName
  } = registrationData;

  const mailOptions = {
    from: email,
    to: process.env.MAIL_USER, // Admin email from env
    subject: 'New Course Registration',
    html: `
      <h2>New Registration Received</h2>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mobile:</strong> ${mobileNo}</p>
      <p><strong>Date of Birth:</strong> ${new Date(dob).toDateString()}</p>
      <p><strong>Occupation:</strong> ${occupation}</p>
      <p><strong>Registered For:</strong> ${levelName}</p>
    `
  };

  console.log(mailOptions);
  await transporter.sendMail(mailOptions);
};

// User confirmation email for registration
const sendUserConfirmationEmail = async (registrationData) => {
  const {
    firstName, lastName, email, levelName, city, courseDetailDate, 
    courseDetailTime, timeslot
  } = registrationData;

  // Format date and time
  const formattedDate = courseDetailDate ? new Date(courseDetailDate).toDateString() : 'TBD';
  const timeInfo = courseDetailTime || timeslot || 'TBD';

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email, // User's email
    subject: 'Registration Confirmed – Your EKAA Course Details',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Registration Confirmed – Your EKAA Course Details</h2>
        
        <p>Dear ${firstName},</p>
        
        <p>Thank you for registering with EKAA.</p>
        
        <p>We're excited to welcome you to the upcoming <strong>${levelName}</strong> in <strong>${city}</strong>.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">📌 Registration Details:</h3>
          <p><strong>Course:</strong> ${levelName}</p>
          <p><strong>City:</strong> ${city}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${timeInfo}</p>
        </div>
        
        <div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">📅 What's Next:</h3>
          <p>A representative from EKAA will be connecting with you shortly to guide you through the next steps and provide any additional details you may need.</p>
        </div>
        
        <p>For any queries in the meantime, feel free to contact us at <a href="mailto:connect@ekaausa.com">connect@ekaausa.com</a>.</p>
        
        <p style="margin-top: 30px;">
          Warm regards,<br>
          <strong>Team EKAA</strong>
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Admin notification email for contact form
const sendAdminNotification = async (contactData) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.MAIL_USER,
      replyTo: contactData.email,
      subject: `🔔 New Contact Form Submission - ${contactData.fullName}`,
      html: generateAdminEmailTemplate(contactData),
      attachments: contactData.uploadImage?.path ? [{
        filename: contactData.uploadImage.originalName,
        path: contactData.uploadImage.path
      }] : []
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Admin notification sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Admin email failed:', error);
    throw error;
  }
};

// Client confirmation email for contact form
const sendClientConfirmation = async (contactData) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: contactData.email,
      subject: '✅ Thank you for contacting us - We received your message',
      html: generateClientEmailTemplate(contactData)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Client confirmation sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Client email failed:', error);
    throw error;
  }
};

// Helper function to generate admin email template
const generateAdminEmailTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          .container { font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 25px; background: #f8f9fa; border-radius: 0 0 10px 10px; }
          .field { margin: 15px 0; padding: 12px; background: white; border-left: 4px solid #667eea; border-radius: 5px; }
          .field strong { color: #333; display: inline-block; width: 130px; }
          .message-box { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 15px 0; }
          .attachment-info { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📧 New Contact Form Submission</h2>
            <p>A new inquiry has been received through your website</p>
          </div>
          <div class="content">
            <div class="field"><strong>👤 Full Name:</strong> ${data.fullName}</div>
            <div class="field"><strong>📧 Email:</strong> ${data.email}</div>
            <div class="field"><strong>📱 Contact:</strong> ${data.contactNo}</div>
            <div class="field"><strong>🌍 Country:</strong> ${data.country}</div>
            <div class="field"><strong>📮 Zip Code:</strong> ${data.zipCode}</div>
            <div class="field"><strong>📝 Privacy Policy:</strong> ${data.readPrivacyPolicy ? '✅ Accepted' : '❌ Not Accepted'}</div>
            <div class="field"><strong>⏰ Submitted:</strong> ${new Date().toLocaleString()}</div>
            
            ${data.uploadImage?.filename ? `
              <div class="attachment-info">
                <strong>📎 Attachment:</strong> ${data.uploadImage.originalName} (${(data.uploadImage.size / 1024).toFixed(2)} KB)
              </div>
            ` : ''}

            <div class="message-box">
              <h3>💬 Message:</h3>
              <p style="line-height: 1.6; margin: 0;">${data.message.replace(/\n/g, '<br>')}</p>
            </div>

            <div class="footer">
              <p><em>Reply to this email to respond directly to the customer</em></p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Helper function to generate client email template
const generateClientEmailTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px; }
          .highlight { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .next-steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50; }
          .footer { text-align: center; padding: 20px; color: #666; border-top: 1px solid #ddd; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎉 Thank You for Reaching Out!</h2>
            <p>We've received your message and will get back to you soon</p>
          </div>
          <div class="content">
            <p>Dear <strong>${data.fullName}</strong>,</p>
            
            <div class="highlight">
              <h3>✅ Your message has been successfully received!</h3>
              <p><strong>Reference ID:</strong> #${Date.now().toString().slice(-8)}</p>
              <p><strong>Submitted on:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <div class="next-steps">
              <h3>📋 What happens next?</h3>
              <ul style="line-height: 1.8;">
                <li>Our team will review your inquiry within 24 hours</li>
                <li>We'll respond to your email: <strong>${data.email}</strong></li>
                
              </ul>
            </div>

            
            <p>Thank you for contacting us. We will be in touch soon to help take your journey forward</p>

            <div class="footer">
              <p><strong>Best regards,</strong><br>Team EKAA</p>
              
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

module.exports = {
  sendRegistrationEmail,
  sendUserConfirmationEmail,
  sendAdminNotification,
  sendClientConfirmation,
  generateAdminEmailTemplate,
  generateClientEmailTemplate
};