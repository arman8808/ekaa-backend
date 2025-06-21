// const Registration = require('../models/Registration');
// const sendRegistrationEmail = require('.././utils/mailer');

// exports.createRegistration = async (req, res) => {
//   try {
//     const idPhotofrontPath = req.files.idPhotofront[0].path;
//     const idphotobackPath = req.files.idphotoback[0].path;

//     const registrationData = {
//       ...req.body,
//       idPhotofront: idPhotofrontPath,
//       idphotoback: idphotobackPath
//     };

//     const registration = new Registration(registrationData);
//     await registration.save();

//     await sendRegistrationEmail(registration);

//     res.status(201).json({
//       success: true,
//       message: 'Registration successful!',
//       data: registration
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: 'Registration failed. Please check your input and try again.',
//       error: error.message
//     });
//   }
// };

// exports.getRegistrations = async (req, res) => {
//   try {
//     const registrations = await Registration.find();
//     res.status(200).json({ 
//       success: true, 
//       message: 'Registrations fetched successfully.',
//       data: registrations 
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to fetch registrations.',
//       error: error.message 
//     });
//   }
// }; 





const Registration = require('../models/Registration');
const { sendRegistrationEmail, sendUserConfirmationEmail } = require('.././utils/mailer');

exports.createRegistration = async (req, res) => {
  try {
    const idPhotofrontPath = req.files.idPhotofront[0].path;
    const idphotobackPath = req.files.idphotoback[0].path;
    const profilePhotoPath = req.files.profileImage[0].path;


    const registrationData = {
      ...req.body,
      idPhotofront: idPhotofrontPath,
      idphotoback: idphotobackPath,
      profileImage:profilePhotoPath
    };

    const registration = new Registration(registrationData);
    await registration.save();

    // Send notification email to admin
    await sendRegistrationEmail(registration);
    
    // Send confirmation email to user
    await sendUserConfirmationEmail(registration);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: registration
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Registration failed. Please check your input and try again.',
      error: error.message
    });
  }
};

exports.getRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find();
    res.status(200).json({ 
      success: true, 
      message: 'Registrations fetched successfully.',
      data: registrations 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch registrations.',
      error: error.message 
    });
  }
}; 