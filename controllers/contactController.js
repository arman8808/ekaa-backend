// const Contact = require('../models/Contact');
// const { 
//   sendAdminNotification, 
//   sendClientConfirmation 
// } = require('../utils/mailer'); // Your fixed email service

// // Validation helper function
// const validateContactData = (data) => {
//   const errors = [];
//   const requiredFields = ['fullName', 'email', 'contactNo', 'country', 'zipCode', 'message'];
  
//   // Check required fields
//   requiredFields.forEach(field => {
//     if (!data[field] || data[field].toString().trim() === '') {
//       errors.push(`${field} is required`);
//     }
//   });

//   // Validate email format
//   if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
//     errors.push('Please enter a valid email address');
//   }

//   // Validate privacy policy
//   if (data.readPrivacyPolicy !== 'true' && data.readPrivacyPolicy !== true) {
//     errors.push('You must accept the privacy policy to proceed');
//   }

//   // Validate contact number
//   if (data.contactNo && (data.contactNo.length < 10 || data.contactNo.length > 15)) {
//     errors.push('Contact number must be between 10-15 digits');
//   }

//   // Validate message length
//   if (data.message && (data.message.length < 10 || data.message.length > 1000)) {
//     errors.push('Message must be between 10-1000 characters');
//   }

//   return errors;
// };

// // Get client IP address helper
// const getClientIp = (req) => {
//   return req.ip || 
//          req.connection.remoteAddress || 
//          req.socket.remoteAddress ||
//          (req.connection.socket ? req.connection.socket.remoteAddress : null);
// };

// // ========================= CONTROLLER FUNCTIONS =========================

// // Create new contact submission
// const createContact = async (req, res) => {
//   try {
//     console.log('📝 New contact form submission received');
//     console.log('Request body:', req.body);
//     console.log('Uploaded file:', req.file);

//     // Extract and validate data
//     const {
//       fullName,
//       email,
//       contactNo,
//       country,
//       zipCode,
//       readPrivacyPolicy,
//       message
//     } = req.body;

//     // Validate input data
//     const validationErrors = validateContactData(req.body);
//     if (validationErrors.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         errors: validationErrors
//       });
//     }

//     // Prepare contact data
//     const contactData = {
//       fullName: fullName.trim(),
//       email: email.trim().toLowerCase(),
//       contactNo: contactNo.trim(),
//       country: country.trim(),
//       zipCode: zipCode.trim(),
//       readPrivacyPolicy: true,
//       message: message.trim(),
//       ipAddress: getClientIp(req),
//       userAgent: req.get('User-Agent') || 'Unknown'
//     };

//     // Handle file upload if present
//     if (req.file) {
//       contactData.uploadImage = {
//         filename: req.file.filename,
//         originalName: req.file.originalname,
//         mimetype: req.file.mimetype,
//         size: req.file.size,
//         path: req.file.path
//       };
//       console.log('📎 File uploaded:', req.file.originalname);
//     }

//     // Save to database
//     const newContact = new Contact(contactData);
//     const savedContact = await newContact.save();
//     console.log('💾 Contact saved to database with ID:', savedContact._id);

//     // Send emails
//     const emailResults = {
//       admin: { success: false, error: null },
//       client: { success: false, error: null }
//     };

//     // Send admin notification
//     try {
//       console.log('📧 Sending admin notification...');
//       emailResults.admin = await sendAdminNotification(savedContact);
//       console.log('✅ Admin notification sent successfully');
//     } catch (adminEmailError) {
//       console.error('❌ Admin email failed:', adminEmailError.message);
//       emailResults.admin.error = adminEmailError.message;
//     }

//     // Send client confirmation
//     try {
//       console.log('📧 Sending client confirmation...');
//       emailResults.client = await sendClientConfirmation(savedContact);
//       console.log('✅ Client confirmation sent successfully');
//     } catch (clientEmailError) {
//       console.error('❌ Client email failed:', clientEmailError.message);
//       emailResults.client.error = clientEmailError.message;
//     }

//     // Update email status in database
//     try {
//       await Contact.findByIdAndUpdate(savedContact._id, {
//         'isEmailSent.admin': emailResults.admin.success,
//         'isEmailSent.client': emailResults.client.success
//       });
//       console.log('📊 Email status updated in database');
//     } catch (updateError) {
//       console.error('❌ Failed to update email status:', updateError.message);
//     }

//     // Generate reference ID
//     const referenceId = `#${savedContact._id.toString().slice(-8).toUpperCase()}`;

//     // Success response
//     res.status(201).json({
//       success: true,
//       message: 'Your message has been successfully submitted!',
//       data: {
//         id: savedContact._id,
//         referenceId: referenceId,
//         submittedAt: savedContact.createdAt,
//         emailStatus: {
//           adminNotified: emailResults.admin.success,
//           confirmationSent: emailResults.client.success
//         }
//       }
//     });

//     console.log(`🎉 Contact form processed successfully - Reference: ${referenceId}`);

//   } catch (error) {
//     console.error('💥 Contact creation failed:', error);

//     // Handle mongoose validation errors
//     if (error.name === 'ValidationError') {
//       const mongooseErrors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         errors: mongooseErrors
//       });
//     }

//     // Handle duplicate email error
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: 'A contact with this email already exists'
//       });
//     }

//     // Generic error response
//     res.status(500).json({
//       success: false,
//       message: 'Failed to submit your message. Please try again later.',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get all contacts (Admin function)
// const getAllContacts = async (req, res) => {
//   try {
//     console.log('📋 Fetching all contacts...');

//     const {
//       page = 1,
//       limit = 10,
//       status,
//       sortBy = 'createdAt',
//       sortOrder = 'desc',
//       search
//     } = req.query;

//     // Build filter object
//     const filter = {};
//     if (status) filter.status = status;
//     if (search) {
//       filter.$or = [
//         { fullName: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { country: { $regex: search, $options: 'i' } }
//       ];
//     }

//     // Build sort object
//     const sort = {};
//     sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

//     // Execute query
//     const contacts = await Contact.find(filter)
//       .sort(sort)
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .select('-ipAddress -userAgent'); // Hide sensitive data

//     const total = await Contact.countDocuments(filter);

//     console.log(`📊 Found ${contacts.length} contacts out of ${total} total`);

//     res.json({
//       success: true,
//       data: contacts,
//       pagination: {
//         page: Number(page),
//         limit: Number(limit),
//         total,
//         pages: Math.ceil(total / limit),
//         hasNext: page * limit < total,
//         hasPrev: page > 1
//       }
//     });

//   } catch (error) {
//     console.error('💥 Get contacts failed:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch contacts',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get single contact by ID
// const getContactById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log(`🔍 Fetching contact with ID: ${id}`);

//     const contact = await Contact.findById(id);
    
//     if (!contact) {
//       return res.status(404).json({
//         success: false,
//         message: 'Contact not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: contact
//     });

//   } catch (error) {
//     console.error('💥 Get contact by ID failed:', error);
    
//     if (error.name === 'CastError') {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid contact ID format'
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch contact',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Update contact status
// const updateContactStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     console.log(`🔄 Updating contact ${id} status to: ${status}`);

//     const validStatuses = ['pending', 'in-progress', 'resolved', 'closed'];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
//       });
//     }

//     const updatedContact = await Contact.findByIdAndUpdate(
//       id,
//       { status, updatedAt: new Date() },
//       { new: true, runValidators: true }
//     );

//     if (!updatedContact) {
//       return res.status(404).json({
//         success: false,
//         message: 'Contact not found'
//       });
//     }

//     console.log(`✅ Contact status updated successfully to: ${status}`);

//     res.json({
//       success: true,
//       message: 'Contact status updated successfully',
//       data: updatedContact
//     });

//   } catch (error) {
//     console.error('💥 Update status failed:', error);
    
//     if (error.name === 'CastError') {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid contact ID format'
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Failed to update contact status',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Delete contact (Admin function)
// const deleteContact = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log(`🗑️ Deleting contact with ID: ${id}`);

//     const deletedContact = await Contact.findByIdAndDelete(id);
    
//     if (!deletedContact) {
//       return res.status(404).json({
//         success: false,
//         message: 'Contact not found'
//       });
//     }

//     // Delete associated file if exists
//     if (deletedContact.uploadImage?.path) {
//       try {
//         fs.unlinkSync(deletedContact.uploadImage.path);
//         console.log('📎 Associated file deleted');
//       } catch (fileError) {
//         console.error('❌ Failed to delete associated file:', fileError.message);
//       }
//     }

//     console.log('✅ Contact deleted successfully');

//     res.json({
//       success: true,
//       message: 'Contact deleted successfully',
//       data: { id: deletedContact._id }
//     });

//   } catch (error) {
//     console.error('💥 Delete contact failed:', error);
    
//     if (error.name === 'CastError') {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid contact ID format'
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete contact',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get contact statistics (Admin function)
// const getContactStats = async (req, res) => {
//   try {
//     console.log('📊 Generating contact statistics...');

//     const stats = await Contact.aggregate([
//       {
//         $group: {
//           _id: '$status',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     const totalContacts = await Contact.countDocuments();
//     const todayContacts = await Contact.countDocuments({
//       createdAt: {
//         $gte: new Date(new Date().setHours(0, 0, 0, 0))
//       }
//     });

//     const statusCounts = {
//       pending: 0,
//       'in-progress': 0,
//       resolved: 0,
//       closed: 0
//     };

//     stats.forEach(stat => {
//       statusCounts[stat._id] = stat.count;
//     });

//     res.json({
//       success: true,
//       data: {
//         total: totalContacts,
//         today: todayContacts,
//         byStatus: statusCounts
//       }
//     });

//   } catch (error) {
//     console.error('💥 Get contact stats failed:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch contact statistics',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// module.exports = {
//     createContact,
//     getAllContacts,
//     getContactById,
//     deleteContact,
//     updateContactStatus
// }


















const Contact = require('../models/Contact');
const { 
  sendAdminNotification, 
  sendClientConfirmation 
} = require('../utils/mailer');

// ========================= VALIDATION UTILITIES =========================

const validateContactData = (data) => {
  const errors = [];
  const requiredFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'country', 'zipCode', 'message'];
  
  // Check required fields
  requiredFields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      errors.push(`${field} is required`);
    }
  });

  // Validate email format
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Please enter a valid email address');
  }

  // Validate privacy policy acceptance
  if (data.acceptPrivacyPolicy !== 'true' && data.acceptPrivacyPolicy !== true) {
    errors.push('You must accept the privacy policy to proceed');
  }

  // Validate phone number
  if (data.phoneNumber && (data.phoneNumber.length < 10 || data.phoneNumber.length > 15)) {
    errors.push('Phone number must be between 10-15 digits');
  }

  // Validate message length
  if (data.message && (data.message.length < 10 || data.message.length > 1000)) {
    errors.push('Message must be between 10-1000 characters');
  }

  // Validate name lengths
  if (data.firstName && (data.firstName.length < 2 || data.firstName.length > 50)) {
    errors.push('First name must be between 2-50 characters');
  }
  
  if (data.lastName && (data.lastName.length < 2 || data.lastName.length > 50)) {
    errors.push('Last name must be between 2-50 characters');
  }

  return errors;
};

// ========================= CONTROLLER FUNCTIONS =========================

const createContact = async (req, res) => {
  try {
    console.log('📝 New contact form submission received');
    console.log('Request body:', req.body);

    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      country,
      zipCode,
      message,
      acceptPrivacyPolicy
    } = req.body;

    // Validate input data
    const validationErrors = validateContactData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Prepare contact data
    const contactData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      country: country.trim(),
      zipCode: zipCode.trim(),
      message: message.trim(),
      acceptPrivacyPolicy: true
    };

    // Save to database
    const newContact = new Contact(contactData);
    const savedContact = await newContact.save();
    console.log('💾 Contact saved to database with ID:', savedContact._id);

    // Send emails
    const emailResults = {
      admin: { success: false, error: null },
      client: { success: false, error: null }
    };

    // Send admin notification
    try {
      console.log('📧 Sending admin notification...');
      emailResults.admin = await sendAdminNotification(savedContact);
      console.log('✅ Admin notification sent successfully');
    } catch (adminEmailError) {
      console.error('❌ Admin email failed:', adminEmailError.message);
      emailResults.admin.error = adminEmailError.message;
    }

    // Send client confirmation
    try {
      console.log('📧 Sending client confirmation...');
      emailResults.client = await sendClientConfirmation(savedContact);
      console.log('✅ Client confirmation sent successfully');
    } catch (clientEmailError) {
      console.error('❌ Client email failed:', clientEmailError.message);
      emailResults.client.error = clientEmailError.message;
    }

    // Generate reference ID
    const referenceId = `#${savedContact._id.toString().slice(-8).toUpperCase()}`;

    // Success response
    res.status(201).json({
      success: true,
      message: 'Your message has been successfully submitted!',
      data: {
        id: savedContact._id,
        referenceId: referenceId,
        submittedAt: savedContact.createdAt,
        fullName: savedContact.fullName,
        email: savedContact.email,
        emailStatus: {
          adminNotified: emailResults.admin.success,
          confirmationSent: emailResults.client.success
        }
      }
    });

    console.log(`🎉 Contact form processed successfully - Reference: ${referenceId}`);

  } catch (error) {
    console.error('💥 Contact creation failed:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const mongooseErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: mongooseErrors
      });
    }

    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A contact with this email already exists'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: 'Failed to submit your message. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getAllContacts = async (req, res) => {
  try {
    console.log('📋 Fetching all contacts...');

    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const contacts = await Contact.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Contact.countDocuments(filter);

    console.log(`📊 Found ${contacts.length} contacts out of ${total} total`);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('💥 Get contacts failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Fetching contact with ID: ${id}`);

    const contact = await Contact.findById(id).select('-__v');
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      data: contact
    });

  } catch (error) {
    console.error('💥 Get contact by ID failed:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`🔄 Updating contact ${id} status to: ${status}`);

    const validStatuses = ['pending', 'in-progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!updatedContact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    console.log(`✅ Contact status updated successfully to: ${status}`);

    res.json({
      success: true,
      message: 'Contact status updated successfully',
      data: updatedContact
    });

  } catch (error) {
    console.error('💥 Update status failed:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update contact status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting contact with ID: ${id}`);

    const deletedContact = await Contact.findByIdAndDelete(id);
    
    if (!deletedContact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    console.log('✅ Contact deleted successfully');

    res.json({
      success: true,
      message: 'Contact deleted successfully',
      data: { id: deletedContact._id }
    });

  } catch (error) {
    console.error('💥 Delete contact failed:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete contact',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getContactStats = async (req, res) => {
  try {
    console.log('📊 Generating contact statistics...');

    // Get status distribution
    const statusStats = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total counts
    const totalContacts = await Contact.countDocuments();
    const todayContacts = await Contact.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });

    // Get this month's contacts
    const thisMonthContacts = await Contact.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    // Format status counts
    const statusCounts = {
      pending: 0,
      'in-progress': 0,
      resolved: 0,
      closed: 0
    };

    statusStats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        total: totalContacts,
        today: todayContacts,
        thisMonth: thisMonthContacts,
        byStatus: statusCounts
      }
    });

  } catch (error) {
    console.error('💥 Get contact stats failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactStats
};