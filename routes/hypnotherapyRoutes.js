const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig'); 
const {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramById,
  getProgramsForUsers,
  getProgramByIdForUsers
} = require('../controllers/hypnotherapyController');

// Admin routes
router.get('/', getPrograms);
router.post('/', upload.single('thumbnail'), createProgram); 

// User routes (filtered - no expired events) - MUST come before /:id routes
router.get('/user', getProgramsForUsers);
router.get('/user/:id', getProgramByIdForUsers);

// Admin routes with ID parameters - MUST come after specific routes
router.get('/:id', getProgramById);
router.put('/:id', upload.single('thumbnail'), updateProgram); 
router.delete('/:id', deleteProgram);

module.exports = router;