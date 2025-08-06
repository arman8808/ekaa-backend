const HypnotherapyProgram = require('../models/HypnotherapyProgram');

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
    const program = new HypnotherapyProgram(req.body);
    await program.save();
    res.status(201).json(program);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update a program
exports.updateProgram = async (req, res) => {
  try {
    const program = await HypnotherapyProgram.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    
    res.json(program);
  } catch (err) {
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