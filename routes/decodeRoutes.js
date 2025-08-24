const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');
const {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramById,
  getProgramByIdForUsers,
  getProgramsForUsers
} = require('../controllers/decodeController');

router.get('/', getPrograms);
router.get('/user', getProgramsForUsers);
router.get('/user/:id', getProgramByIdForUsers);
router.post('/', upload.single('thumbnail'), createProgram);
router.get('/:id', getProgramById);
router.put('/:id', upload.single('thumbnail'), updateProgram);
router.delete('/:id', deleteProgram);

module.exports = router;