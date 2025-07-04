const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Admin notification email for registration
const sendRegistrationEmail = async (registrationData) => {
  const { firstName, lastName, email, mobileNo, dob, occupation, levelName } =
    registrationData;

  const mailOptions = {
    from: email,
    to: process.env.MAIL_USER,
    subject: "New Course Registration",
    html: `
      <div style="${emailStyles.container}">
        <div style="${emailStyles.header}">
          <h2 style="margin: 0;">New Registration Received</h2>
        </div>
        <div style="${emailStyles.content}">
          <div style="${emailStyles.field}">
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Mobile:</strong> ${mobileNo}</p>
            <p><strong>Date of Birth:</strong> ${new Date(
              dob
            ).toDateString()}</p>
            <p><strong>Occupation:</strong> ${occupation}</p>
            <p><strong>Registered For:</strong> ${levelName}</p>
          </div>
        </div>
        <div style="${emailStyles.footer}">
          <p>EKAA Registration System &copy; ${new Date().getFullYear()}</p>
        </div>
      </div>
    `,
  };

  console.log(mailOptions);
  await transporter.sendMail(mailOptions);
};

const sendUserConfirmationEmail = async (registrationData) => {
  const {
    firstName,
    lastName,
    email,
    levelName,
    city,
    courseDetailDate,
    courseDetailTime,
    timeslot,
  } = registrationData;

  // Format date and time
  const formattedDate = courseDetailDate
    ? new Date(courseDetailDate).toDateString()
    : "TBD";
  const timeInfo = courseDetailTime || timeslot || "TBD";

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Registration Confirmed – Your EKAA Course Details",
    html: `
      <div style="${emailStyles.container}">
        <div style="${emailStyles.header}">
          <h2 style="margin: 0;">Registration Confirmed – Your EKAA Course Details</h2>
        </div>
        <div style="${emailStyles.content}">
          <p>Dear ${firstName},</p>
          <p>Thank you for registering with EKAA.</p>
          
          <h3 style="${emailStyles.subHeading}">📋 Registration Details</h3>
          <div style="${emailStyles.field}">
            <p><strong>Course:</strong> ${levelName}</p>
            <p><strong>City:</strong> ${city}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${timeInfo}</p>
          </div>
          
          <div style="${emailStyles.highlightBox}">
            <h3 style="${emailStyles.subHeading}">📅 What's Next</h3>
            <p>A representative from EKAA will contact you shortly to guide you through the next steps.</p>
          </div>
          
          <p>For any queries, contact us at <a href="mailto:connect@ekaausa.com" style="color: #667eea; text-decoration: none;">connect@ekaausa.com</a>.</p>
        </div>
        <div style="${emailStyles.footer}">
          <p>EKAA Learning Center &copy; ${new Date().getFullYear()}</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Admin Contact Notification
const sendAdminNotification = async (contactData) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.MAIL_USER,
      replyTo: contactData.email,
      subject: `🔔 New Contact Form Submission - ${contactData.fullName}`,
      html: generateAdminEmailTemplate(contactData),
      attachments: contactData.uploadImage?.path
        ? [
            {
              filename: contactData.uploadImage.originalName,
              path: contactData.uploadImage.path,
            },
          ]
        : [],
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Admin notification sent:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Admin email failed:", error);
    throw error;
  }
};

// Client Contact Confirmation
const sendClientConfirmation = async (contactData) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: contactData.email,
      subject: "✅ Thank you for contacting us - We received your message",
      html: generateClientEmailTemplate(contactData),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Client confirmation sent:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Client email failed:", error);
    throw error;
  }
};

// Helper function to generate admin email template
const generateAdminEmailTemplate = (data) => {
  return `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h2 style="margin: 0;">📧 New Contact Form Submission</h2>
        <p style="margin: 10px 0 0; opacity: 0.9;">A new inquiry has been received through your website</p>
      </div>
      <div style="${emailStyles.content}">
        <div style="${emailStyles.field}">
          <p><strong>👤 Full Name:</strong> ${data.fullName}</p>
          <p><strong>📧 Email:</strong> ${data.email}</p>
          <p><strong>📱 Contact:</strong> ${data.contactNo}</p>
          <p><strong>🌍 Country:</strong> ${data.country}</p>
          <p><strong>📮 Zip Code:</strong> ${data.zipCode}</p>
          <p><strong>📝 Privacy Policy:</strong> ${
            data.readPrivacyPolicy ? "✅ Accepted" : "❌ Not Accepted"
          }</p>
          <p><strong>⏰ Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        ${
          data.uploadImage?.filename
            ? `
          <div style="${emailStyles.highlightBox}">
            <h3 style="${emailStyles.subHeading}">📎 Attachment</h3>
            <p>${data.uploadImage.originalName} (${(
                data.uploadImage.size / 1024
              ).toFixed(2)} KB)</p>
          </div>
        `
            : ""
        }

        <div style="${emailStyles.highlightBox}">
          <h3 style="${emailStyles.subHeading}">💬 Message</h3>
          <p>${data.message.replace(/\n/g, "<br>")}</p>
        </div>
      </div>
      <div style="${emailStyles.footer}">
        <p>Reply directly to this email to respond to the customer</p>
        <p>EKAA Support System &copy; ${new Date().getFullYear()}</p>
      </div>
    </div>
  `;
};

// Helper function to generate client email template
const generateClientEmailTemplate = (data) => {
  return `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h2 style="margin: 0;">🎉 Thank You for Reaching Out!</h2>
        <p style="margin: 10px 0 0; opacity: 0.9;">We've received your message and will get back to you soon</p>
      </div>
      <div style="${emailStyles.content}">
        <p>Dear <strong>${data.fullName}</strong>,</p>
        
        <div style="${emailStyles.highlightBox}">
          <h3 style="${
            emailStyles.subHeading
          }">✅ Your message has been received!</h3>
          <p><strong>Reference ID:</strong> #${Date.now()
            .toString()
            .slice(-8)}</p>
          <p><strong>Submitted on:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div style="${emailStyles.highlightBox}">
          <h3 style="${emailStyles.subHeading}">📋 What happens next?</h3>
          <ul style="${emailStyles.list}">
            <li style="${
              emailStyles.listItem
            }">Our team will review your inquiry within 24 hours</li>
            <li style="${
              emailStyles.listItem
            }">We'll respond to your email: <strong>${data.email}</strong></li>
            <li style="${
              emailStyles.listItem
            }">You'll receive personalized assistance based on your query</li>
          </ul>
        </div>
        
        <p>Thank you for contacting us. We will be in touch soon to help take your journey forward.</p>
      </div>
      <div style="${emailStyles.footer}">
        <p>For immediate assistance, contact us at <a href="mailto:connect@ekaausa.com" style="color: #667eea; text-decoration: none;">connect@ekaausa.com</a></p>
        <p>EKAA Support Team &copy; ${new Date().getFullYear()}</p>
      </div>
    </div>
  `;
};
const emailTemplates = {
  internalNotification: (registration) => `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h2 style="margin: 0; font-weight: 500; font-size: 1.8rem;">New Session Registration</h2>
      </div>
      
      <div style="${emailStyles.content}">
        <div style="${emailStyles.highlightBox}">
          <h3 style="${emailStyles.subHeading}">Session Details</h3>
          
          <div style="${emailStyles.list}">
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Event:</strong> ${registration.event}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Date:</strong> ${registration.date}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Location:</strong> ${registration.location}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Organized By:</strong> ${registration.organisedBy}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Organizer Email:</strong> ${registration.organiserEmail}
              </div>
            </div>
          </div>
        </div>
        
        <div style="${emailStyles.highlightBox}">
          <h3 style="${emailStyles.subHeading}">Registrant Information</h3>
          
          <div style="${emailStyles.list}">
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Name:</strong> ${registration.fullName}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Email:</strong> ${registration.email}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Phone:</strong> ${registration.phone}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Registration ID:</strong> ${registration._id}
              </div>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="mailto:${registration.email}" style="${emailStyles.button}">
            Contact Registrant
          </a>
        </div>
      </div>
      
      <div style="${emailStyles.footer}">
        This registration was received on ${new Date().toLocaleString()}
      </div>
    </div>
  `,

  userConfirmation: (registration) => `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h2 style="margin: 0; font-weight: 500; font-size: 1.8rem;">Registration Confirmation</h2>
      </div>
      
      <div style="${emailStyles.content}">
        <p style="font-size: 16px;">Dear ${registration.fullName},</p>
        
        <p style="font-size: 16px;">Thank you for registering for our session! We've received your registration details and will contact you if any additional information is needed.</p>
        
        <div style="${emailStyles.highlightBox}">
          <h3 style="${emailStyles.subHeading}">Session Details</h3>
          <div style="${emailStyles.list}">
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Event:</strong> ${registration.event}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Date:</strong> ${registration.date}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Location:</strong> ${registration.location}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Organized By:</strong> ${registration.organisedBy}
              </div>
            </div>
          </div>
        </div>
        
        <p style="font-size: 16px;">If you have any questions, please contact us at <a href="mailto:contact@ekaausa.com" style="color: #667eea; text-decoration: none; font-weight: bold;">contact@ekaausa.com</a>.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://ekaausa.com" style="${emailStyles.button}">
            Visit Our Website
          </a>
        </div>
        
        <p style="font-size: 16px; margin-top: 40px;">Best regards,<br><strong>The Ekaa USA Team</strong></p>
      </div>
      
      <div style="${emailStyles.footer}">
        Ekaa USA &bull; contact@ekaausa.com &bull; www.ekaausa.com
      </div>
    </div>
  `,
};

// Send email function
const sendRegistrationEmails = async (registration) => {
  try {
    // Check if date requires payment link
    const paymentDates = ["Aug 12, 2025", "Aug 18, 2025"];
    const needsPaymentLink = paymentDates.includes(registration.date);

    let paymentLinkText = "";
    if (needsPaymentLink) {
      paymentLinkText = `<p style="margin: 15px 0; font-size: 16px;">To complete your registration, please make your payment here: <a href="https://buy.stripe.com/8x2dR189Wgkla7u0Zl93y01" style="color: #0066cc; text-decoration: underline;">Payment Link</a></p>`;
    }

    // Send internal notification email
    await transporter.sendMail({
      from: `"Ekaa USA Registrations" <${process.env.EMAIL_USER}>`,
      to: "contact@ekaausa.com",
      cc: ["connect@ekaausa.com", registration.organiserEmail],
      subject: `New Registration: ${registration.event} - ${registration.date}`,
      html: emailTemplates.internalNotification(registration),
      replyTo: "contact@ekaausa.com",
    });

    // Get base confirmation template
    let userConfirmationHtml = emailTemplates.userConfirmation(registration);

    // Insert payment link if needed
    if (needsPaymentLink) {
      userConfirmationHtml = userConfirmationHtml.replace(
        "<!-- Additional content can be inserted here -->",
        paymentLinkText
      );
    }

    // Send confirmation to user
    await transporter.sendMail({
      from: `"Ekaa USA" <${process.env.EMAIL_USER}>`,
      to: registration.email,
      subject: `Confirmation: ${registration.event} Registration`,
      html: userConfirmationHtml,
      replyTo: "contact@ekaausa.com",
    });

    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};

module.exports = {
  sendRegistrationEmail,
  sendUserConfirmationEmail,
  sendAdminNotification,
  sendClientConfirmation,
  generateAdminEmailTemplate,
  generateClientEmailTemplate,
  sendRegistrationEmails,
};
const emailStyles = {
  container:
    "font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);",
  header:
    "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; text-align: center;",
  content: "padding: 30px; line-height: 1.6; color: #333333;",
  footer:
    "text-align: center; padding: 20px; color: #777777; font-size: 14px; border-top: 1px solid #eeeeee; background: #f8f9fa;",
  field:
    "margin: 15px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #667eea; border-radius: 5px;",
  highlightBox:
    "background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #c5e1ff;",
  heading: "color: #2c3e50; margin-top: 0;",
  subHeading: "color: #2c3e50; margin-bottom: 15px; font-weight: 600;",
  button:
    "display: inline-block; background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0;",
  list: "padding-left: 20px; margin: 15px 0;",
  listItem: "margin-bottom: 10px;",
};
