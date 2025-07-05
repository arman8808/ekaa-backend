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
// const sendRegistrationEmail = async (registrationData) => {
//   const { firstName, lastName, email, mobileNo, dob, occupation, levelName } =
//     registrationData;

//   const mailOptions = {
//     from: email,
//     to: process.env.MAIL_USER,
//     subject: "New Course Registration",
//     html: `
//       <div style="${emailStyles.container}">
//         <div style="${emailStyles.header}">
//           <h2 style="margin: 0;">New Registration Received</h2>
//         </div>
//         <div style="${emailStyles.content}">
//           <div style="${emailStyles.field}">
//             <p><strong>Name:</strong> ${firstName} ${lastName}</p>
//             <p><strong>Email:</strong> ${email}</p>
//             <p><strong>Mobile:</strong> ${mobileNo}</p>
//             <p><strong>Date of Birth:</strong> ${new Date(
//               dob
//             ).toDateString()}</p>
//             <p><strong>Occupation:</strong> ${occupation}</p>
//             <p><strong>Registered For:</strong> ${levelName}</p>
//           </div>
//         </div>
//         <div style="${emailStyles.footer}">
//           <p>EKAA Registration System &copy; ${new Date().getFullYear()}</p>
//         </div>
//       </div>
//     `,
//   };

//   console.log(mailOptions);
//   await transporter.sendMail(mailOptions);
// };

// const sendUserConfirmationEmail = async (registrationData) => {
//   const {
//     firstName,
//     lastName,
//     email,
//     levelName,
//     city,
//     courseDetailDate,
//     courseDetailTime,
//     timeslot,
//   } = registrationData;

//   // Format date and time
//   const formattedDate = courseDetailDate
//     ? new Date(courseDetailDate).toDateString()
//     : "TBD";
//   const timeInfo = courseDetailTime || timeslot || "TBD";

//   const mailOptions = {
//     from: process.env.MAIL_USER,
//     to: email,
//     subject: "Registration Confirmed – Your EKAA Course Details",
//     html: `
//       <div style="${emailStyles.container}">
//         <div style="${emailStyles.header}">
//           <h2 style="margin: 0;">Registration Confirmed – Your EKAA Course Details</h2>
//         </div>
//         <div style="${emailStyles.content}">
//           <p>Dear ${firstName},</p>
//           <p>Thank you for registering with EKAA.</p>
          
//           <h3 style="${emailStyles.subHeading}">📋 Registration Details</h3>
//           <div style="${emailStyles.field}">
//             <p><strong>Course:</strong> ${levelName}</p>
//             <p><strong>City:</strong> ${city}</p>
//             <p><strong>Date:</strong> ${formattedDate}</p>
//             <p><strong>Time:</strong> ${timeInfo}</p>
//           </div>
          
//           <div style="${emailStyles.highlightBox}">
//             <h3 style="${emailStyles.subHeading}">📅 What's Next</h3>
//             <p>A representative from EKAA will contact you shortly to guide you through the next steps.</p>
//           </div>
          
//           <p>For any queries, contact us at <a href="mailto:connect@ekaausa.com" style="color: #667eea; text-decoration: none;">connect@ekaausa.com</a>.</p>
//         </div>
//         <div style="${emailStyles.footer}">
//           <p>EKAA Learning Center &copy; ${new Date().getFullYear()}</p>
//         </div>
//       </div>
//     `,
//   };

//   await transporter.sendMail(mailOptions);
// };

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

  userConfirmation: (registration) => {
    // Check if payment is needed for these dates
    const paymentDates = ["Aug 12, 2025", "Aug 18, 2025"];
    const needsPayment = paymentDates.includes(registration.date);

    return `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h2 style="margin: 0; font-weight: 500; font-size: 1.8rem;">Registration Confirmation</h2>
      </div>
      
      <div style="${emailStyles.content}">
        <p style="font-size: 16px;">Dear ${registration.fullName},</p>
        
        <p style="font-size: 16px;">Thank you for registering for our session! We've received your registration details ${
          needsPayment
            ? "and your payment is required to complete the registration"
            : ""
        }.</p>
        
        ${
          needsPayment
            ? `
          <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
            <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #2d3748;">Complete Your Registration</h3>
            <p style="margin: 0 0 15px 0; font-size: 16px;">Please complete your payment to secure your spot:</p>
            <a href="https://buy.stripe.com/8x2dR189Wgkla7u0Zl93y01" 
               style="${emailStyles.button}; background-color: #4caf50; display: inline-block;">
              Make Payment Now
            </a>
            <p style="margin: 10px 0 0; font-size: 14px; color: #718096;">Payment must be completed within 48 hours.</p>
          </div>
        `
            : ""
        }
        
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
  `;
  },
};

// Send email function
const sendRegistrationEmails = async (registration) => {
  try {
    const paymentLinks = {
      "Aug 12, 2025": "https://buy.stripe.com/8x2dR189Wgkla7u0Zl93y01",
      "Aug 18, 2025": "https://buy.stripe.com/8x2dR189Wgkla7u0Zl93y01",
      "Aug 22, 2025":
        "https://checkout.square.site/merchant/MLWJMSMMV9BVH/checkout/6JPYQHKGG2BK75Q6SMJB35O7",
      "Aug 23, 2025":
        "https://checkout.square.site/merchant/MLWJMSMMV9BVH/checkout/6JPYQHKGG2BK75Q6SMJB35O7",
      "Aug 28, 2025":
        "https://checkout.square.site/merchant/MLWJMSMMV9BVH/checkout/6JPYQHKGG2BK75Q6SMJB35O7",
    };

    const needsPaymentLink = paymentLinks.hasOwnProperty(registration.date);
    const paymentLink = needsPaymentLink
      ? paymentLinks[registration.date]
      : null;

    const emailData = {
      ...registration,
      paymentLink: paymentLink,
    };
    await transporter.sendMail({
      from: `"Ekaa USA Registrations" <${process.env.EMAIL_USER}>`,
      to: "contact@ekaausa.com",
      cc: ["connect@ekaausa.com", registration.organiserEmail],
      subject: `New Registration: ${registration.event} - ${registration.date}`,
      html: emailTemplates.internalNotification(registration),
      replyTo: "contact@ekaausa.com",
    });

    await transporter.sendMail({
      from: `"Ekaa USA" <${process.env.EMAIL_USER}>`,
      to: registration.email,
      subject: `Confirmation: ${registration.event} Registration`,
      html: emailTemplates.userConfirmation(emailData),
      replyTo: "contact@ekaausa.com",
    });

    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};
const DOCTOR_EMAIL_MAP = {
  "Dr Manoj's A/C": "docbhardwaj@gmail.com",
  "Dr Aiyasawmy's A/C": "Aiyasawmy@gmail.com",
  "Dr. Sonia Gupte": "Sonia@enso-nia.com",
};

const ichEmailTemplates = {
  adminNotification: ({ userName, userEmail, registrationId, city }) => {
    const isManojTraining =
      city.includes("ICH L3 Training") || city.includes("ICH L1 Training");
    const trainingType = city.split("|")[1]?.trim() || "ICH Training";
    const trainingDates = city.split("|")[2]?.trim() || "";

    return `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h2 style="margin: 0; font-weight: 500; font-size: 1.8rem;">New ICH Registration</h2>
      </div>
      
      <div style="${emailStyles.content}">
        <div style="${emailStyles.highlightBox}">
          <h3 style="${emailStyles.subHeading}">Registrant Information</h3>
          
          <div style="${emailStyles.list}">
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Name:</strong> ${userName}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Email:</strong> ${userEmail}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Training:</strong> ${trainingType}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Dates:</strong> ${trainingDates}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Registration ID:</strong> ${registrationId}
              </div>
            </div>
          </div>
        </div>
        
        ${
          isManojTraining
            ? `
        <div style="margin: 20px 0; padding: 15px; background-color: #fff8e1; border-radius: 8px; border-left: 4px solid #ffc107;">
          <p style="margin: 0; font-size: 15px;">
            <strong>Note:</strong> Dr. Manoj has been CC'd on this notification as the instructor.
          </p>
        </div>
        `
            : ""
        }
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${
            process.env.ADMIN_PORTAL_URL
          }/registrations/${registrationId}" 
             style="${emailStyles.button}">
            View Full Registration
          </a>
        </div>
      </div>
      
      <div style="${emailStyles.footer}">
        This registration was received on ${new Date().toLocaleString()}
      </div>
    </div>
    `;
  },

  userConfirmation: (registration) => {
    const cityParts = registration.city?.split("|") || [];
    const trainingType = cityParts[1]?.trim() || "ICH Training";
    const trainingDates = cityParts[2]?.trim() || "";

    const isL1 = trainingType.includes("ICH L1 Training");
    const isL3 = trainingType.includes("ICH L3 Training");

    const paymentLinks = {
      l1: "https://checkout.square.site/merchant/MLWJMSMMV9BVH/checkout/75K6WKOBWCFROFGM4LUDBT6I",
      l3: "https://buy.stripe.com/cNidR189W1pr1AY7nJ93y03",
    };

    return `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h2 style="margin: 0; font-weight: 500; font-size: 1.8rem;">ICH Registration Confirmation</h2>
      </div>
      
      <div style="${emailStyles.content}">
        <p style="font-size: 16px;">Dear ${registration.firstName} ${
      registration.lastName
    },</p>
        
        <p style="font-size: 16px;">Thank you for registering for our <strong>${trainingType}</strong> program!</p>
        
        ${
          isL1
            ? `
          <div style="margin: 20px 0; padding: 20px; background-color: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196f3;">
            <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #2d3748;">L1 Training Details</h3>
            <p style="margin: 0 0 15px 0; font-size: 16px;">
              Your training will be conducted by Dr. Manoj Bhardwaj from ${trainingDates}.
            </p>
            <p style="margin: 0 0 15px 0; font-size: 16px;">
              Please complete your payment to secure your spot:
            </p>
            <a href="${paymentLinks.l1}" 
               style="${emailStyles.button}; background-color: #2196f3;">
              Make L1 Payment Now
            </a>
            <p style="margin: 10px 0 0; font-size: 14px; color: #718096;">
              Payment must be completed within 48 hours.
            </p>
          </div>
        `
            : ""
        }
        
        ${
          isL3
            ? `
          <div style="margin: 20px 0; padding: 20px; background-color: #e8f5e9; border-radius: 8px; border-left: 4px solid #4caf50;">
            <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #2d3748;">L3 Training Details</h3>
            <p style="margin: 0 0 15px 0; font-size: 16px;">
              Your training will be conducted by Dr. Manoj Bhardwaj from ${trainingDates}.
            </p>
            ${
              paymentLinks.l3
                ? `
            <p style="margin: 0 0 15px 0; font-size: 16px;">
              Please complete your payment to secure your spot:
            </p>
            <a href="${paymentLinks.l3}" 
               style="${emailStyles.button}; background-color: #4caf50;">
              Make L3 Payment Now
            </a>
            <p style="margin: 10px 0 0; font-size: 14px; color: #718096;">
              Payment must be completed within 48 hours.
            </p>
            `
                : ""
            }
          </div>
        `
            : ""
        }
        
        <div style="${emailStyles.highlightBox}">
          <h3 style="${emailStyles.subHeading}">Your Registration Details</h3>
          <div style="${emailStyles.list}">
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Training Program:</strong> ${trainingType}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Dates:</strong> ${trainingDates}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Name on Certificate:</strong> ${
                  registration.nameAsCertificate
                }
              </div>
            </div>
            ${
              registration.timeslot
                ? `
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Time Slot:</strong> ${registration.timeslot}
              </div>
            </div>
            `
                : ""
            }
          </div>
        </div>
        
        <p style="font-size: 16px;">
          If you have any questions, please contact us at 
          <a href="mailto:contact@ekaausa.com" style="color: #667eea; text-decoration: none;">
            contact@ekaausa.com
          </a>.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://ekaausa.com/ich" style="${emailStyles.button}">
            View Program Details
          </a>
        </div>
        
        <p style="font-size: 16px; margin-top: 40px;">
          Best regards,<br>
          <strong>The Ekaa USA ICH Team</strong>
        </p>
      </div>
      
      <div style="${emailStyles.footer}">
        Ekaa USA ICH Program &bull; contact@ekaausa.com &bull; www.ekaausa.com/ich
      </div>
    </div>
    `;
  },
};

const sendICHUserConfirmation = async ({ email, name, registration }) => {
  try {
    await transporter.sendMail({
      from: `"Ekaa USA ICH Program" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "ICH Registration Confirmation",
      html: ichEmailTemplates.userConfirmation(registration),
      replyTo: "contact@ekaausa.com",
    });
    return true;
  } catch (error) {
    console.error("ICH User email error:", error);
    return false;
  }
};

const sendICHAdminNotification = async ({
  userEmail,
  userName,
  registrationId,
  city,
}) => {
  try {
    const isL1Training = city.includes("ICH L1 Training");
    const isL3Training = city.includes("ICH L3 Training");
    const cc = ["connect@ekaausa.com"];

    if (isL1Training) {
      cc.push(DOCTOR_EMAIL_MAP["Dr Manoj's A/C"]);
    } else if (isL3Training) {
      cc.push(DOCTOR_EMAIL_MAP["Dr Aiyasawmy's A/C"]);
    }

    await transporter.sendMail({
      from: `"Ekaa USA ICH Registrations" <${process.env.EMAIL_USER}>`,
      to: "contact@ekaausa.com",
      cc: cc,
      subject: `New ICH Registration: ${userName}`,
      html: ichEmailTemplates.adminNotification({
        userName,
        userEmail,
        registrationId,
        city,
      }),
      replyTo: "contact@ekaausa.com",
    });
    return true;
  } catch (error) {
    console.error("ICH Admin email error:", error);
    return false;
  }
};

const decodeEmailTemplates = {
  adminNotification: (registration) => {
    const isDecodeChild = registration.city?.includes("Decode The Child");
    const cityParts = registration.city?.split("|") || [];
    const eventName = cityParts[1]?.trim() || "EKAA Program";
    const eventDate = cityParts[2]?.trim() || "";

    return `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h2 style="margin: 0; font-weight: 500; font-size: 1.8rem;">New Registration: ${eventName}</h2>
      </div>
      
      <div style="${emailStyles.content}">
        <div style="${emailStyles.highlightBox}">
          <h3 style="${emailStyles.subHeading}">Registrant Information</h3>
          
          <div style="${emailStyles.list}">
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Name:</strong> ${registration.firstName} ${
      registration.lastName
    }
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Email:</strong> ${registration.email}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Program:</strong> ${eventName}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Date:</strong> ${eventDate}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Phone:</strong> ${registration.mobileNo}
              </div>
            </div>
          </div>
        </div>
        
        ${
          isDecodeChild
            ? `
        <div style="margin: 20px 0; padding: 15px; background-color: #fff8e1; border-radius: 8px; border-left: 4px solid #ffc107;">
          <p style="margin: 0; font-size: 15px;">
            <strong>Note:</strong> Dr. Manoj has been CC'd on this notification for Decode The Child program.
          </p>
        </div>
        `
            : ""
        }
      </div>
      
      <div style="${emailStyles.footer}">
        Registration received on ${new Date().toLocaleString()}
      </div>
    </div>
    `;
  },

  userConfirmation: (registration) => {
    const cityParts = registration.city?.split("|") || [];
    const eventName = cityParts[1]?.trim() || "EKAA Program";
    const eventDate = cityParts[2]?.trim() || "";
    const isDecodeChild = eventName.includes("Decode The Child");
    const paymentLink =
      "https://buy.stripe.com/6oU6ozgGsc45cfCgYj93y02";

    return `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h2 style="margin: 0; font-weight: 500; font-size: 1.8rem;">Registration Confirmation</h2>
      </div>
      
      <div style="${emailStyles.content}">
        <p style="font-size: 16px;">Dear ${registration.firstName} ${
      registration.lastName
    },</p>
        
        <p style="font-size: 16px;">Thank you for registering for our <strong>${eventName}</strong> program!</p>
        
        ${
          isDecodeChild
            ? `
          <div style="margin: 20px 0; padding: 20px; background-color: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196f3;">
            <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #2d3748;">Decode The Child Details</h3>
            <p style="margin: 0 0 15px 0; font-size: 16px;">
              Your session with Dr. Manoj Bhardwaj will be on ${eventDate}.
            </p>
            <p style="margin: 0 0 15px 0; font-size: 16px;">
              Please complete your payment to confirm your spot:
            </p>
            <a href="${paymentLink}" 
               style="${emailStyles.button}; background-color: #2196f3;">
              Make Payment Now
            </a>
            <p style="margin: 10px 0 0; font-size: 14px; color: #718096;">
              Payment must be completed within 48 hours.
            </p>
          </div>
        `
            : ""
        }
        
        <div style="${emailStyles.highlightBox}">
          <h3 style="${emailStyles.subHeading}">Your Registration Details</h3>
          <div style="${emailStyles.list}">
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Program:</strong> ${eventName}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Date:</strong> ${eventDate}
              </div>
            </div>
            ${
              registration.timeslot
                ? `
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Time Slot:</strong> ${registration.timeslot}
              </div>
            </div>
            `
                : ""
            }
          </div>
        </div>
        
        <p style="font-size: 16px;">
          For questions, contact <a href="mailto:connect@ekaausa.com" style="color: #667eea; text-decoration: none;">
            connect@ekaausa.com
          </a>
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://ekaausa.com" style="${emailStyles.button}">
            Visit Our Website
          </a>
        </div>
      </div>
      
      <div style="${emailStyles.footer}">
        EKAA Learning Center &copy; ${new Date().getFullYear()}
      </div>
    </div>
    `;
  },
};

// Updated email sending functions
const sendRegistrationEmail = async (registration) => {
  try {
    const isDecodeChild = registration.city?.includes("Decode The Child");
    const cc = ["connect@ekaausa.com"];

    if (isDecodeChild) {
      cc.push(DOCTOR_EMAIL_MAP["Dr Aiyasawmy's A/C"]);
    }

    await transporter.sendMail({
      from: `"EKAA Registrations" <${process.env.MAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      cc: cc,
      subject: `New Registration: ${
        registration.city?.split("|")[1]?.trim() || "EKAA Program"
      }`,
      html: decodeEmailTemplates.adminNotification(registration),
      replyTo: "connect@ekaausa.com",
    });
  } catch (error) {
    console.error("Admin email error:", error);
  }
};

const sendUserConfirmationEmail = async (registration) => {
  try {
    await transporter.sendMail({
      from: `"EKAA Programs" <${process.env.MAIL_USER}>`,
      to: registration.email,
      subject: `Confirmation: ${
        registration.city?.split("|")[1]?.trim() || "EKAA Program"
      } Registration`,
      html: decodeEmailTemplates.userConfirmation(registration),
      replyTo: "connect@ekaausa.com",
    });
  } catch (error) {
    console.error("User email error:", error);
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
  sendICHAdminNotification,
  sendICHUserConfirmation,
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
