const HypnotherapyProgram = require('../models/HypnotherapyProgram');
const fs = require('fs');
const path = require('path');

// Helper function to process form data
const processProgramData = (req) => {
  let programData;
  
  if (req.file) {
    // If there's a file upload, process form data
    programData = JSON.parse(JSON.stringify(req.body));
    
    // Handle arrays that were stringified
    if (programData.cardPoints) {
      programData.cardPoints = JSON.parse(programData.cardPoints);
    }
    if (programData.learningSections) {
      programData.learningSections = JSON.parse(programData.learningSections);
    }
    if (programData.upcomingEvents) {
      programData.upcomingEvents = JSON.parse(programData.upcomingEvents);
    }
    
    // Add the thumbnail filename
    programData.thumbnail = req.file.filename;
  } else {
    // No file upload, use body directly
    programData = req.body;
  }
  
  return programData;
};

// Get all programs with pagination and search
exports.getPrograms = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    
    const query = {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } }
      ]
    };

    const programs = await HypnotherapyProgram.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await HypnotherapyProgram.countDocuments(query);

    res.json({
      programs,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalPrograms: count
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new program
exports.createProgram = async (req, res) => {
  try {
    const programData = processProgramData(req);
    const program = new HypnotherapyProgram(programData);
    await program.save();
    res.status(201).json(program);
  } catch (err) {
    // Clean up uploaded file if there was an error
    if (req.file) {
      fs.unlinkSync(path.join('uploads', req.file.filename));
    }
    res.status(400).json({ message: err.message });
  }
};

// Update a program
exports.updateProgram = async (req, res) => {
  try {
    let oldThumbnail = null;
    
    // Get the current program to check for existing thumbnail
    const currentProgram = await HypnotherapyProgram.findById(req.params.id);
    if (currentProgram && currentProgram.thumbnail) {
      oldThumbnail = currentProgram.thumbnail;
    }
    
    const programData = processProgramData(req);
    
    const program = await HypnotherapyProgram.findByIdAndUpdate(
      req.params.id,
      programData,
      { new: true, runValidators: true }
    );
    
    if (!program) {
      // Clean up the new thumbnail if program wasn't found
      if (req.file) {
        fs.unlinkSync(path.join('uploads', req.file.filename));
      }
      return res.status(404).json({ message: 'Program not found' });
    }
    
    // Delete old thumbnail if it was replaced
    if (req.file && oldThumbnail) {
      try {
        fs.unlinkSync(path.join('uploads', oldThumbnail));
      } catch (err) {
        console.error('Error deleting old thumbnail:', err);
      }
    }
    
    res.json(program);
  } catch (err) {
    // Clean up uploaded file if there was an error
    if (req.file) {
      fs.unlinkSync(path.join('uploads', req.file.filename));
    }
    res.status(400).json({ message: err.message });
  }
};

// Delete a program
exports.deleteProgram = async (req, res) => {
  try {
    const program = await HypnotherapyProgram.findByIdAndDelete(req.params.id);
    
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    
    // Delete associated thumbnail if it exists
    if (program.thumbnail) {
      try {
        fs.unlinkSync(path.join('uploads', program.thumbnail));
      } catch (err) {
        console.error('Error deleting thumbnail:', err);
      }
    }
    
    res.json({ message: 'Program deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single program by ID
exports.getProgramById = async (req, res) => {
  try {
    const program = await HypnotherapyProgram.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    
    res.json(program);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};