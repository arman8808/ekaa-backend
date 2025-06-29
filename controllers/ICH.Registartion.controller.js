const ICHRegistration = require('../models/ICH.Registartion.modal');
// const { sendICHUserConfirmation, sendICHAdminNotification } = require('../services/ichEmailService');

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
    // await sendICHUserConfirmation({
    //   email: req.body.email,
    //   name: `${req.body.firstName} ${req.body.lastName}`,
    // });

    // await sendICHAdminNotification({
    //   userEmail: req.body.email,
    //   userName: `${req.body.firstName} ${req.body.lastName}`,
    //   registrationId: ichRegistration._id,
    // });

    res.status(201).json({
      success: true,
      message: 'ICH Registration submitted successfully!',
      data: {
        id: ichRegistration._id,
        userEmailSent: true,
        adminEmailSent: true
      },
    });
  } catch (error) {
    console.error('ICH Registration error:', error);
    
    // Handle Multer errors
    if (error.name === 'MulterError') {
      return res.status(400).json({
        success: false,
        message: `File upload error: ${error.message}`
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit ICH registration'
    });
  }
};