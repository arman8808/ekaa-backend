const express = require('express');
const router = express.Router();
const {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramById
} = require('../controllers/hypnotherapyController');

router.get('/', getPrograms);
router.post('/', createProgram);
router.get('/:id', getProgramById);
router.put('/:id', updateProgram);
router.delete('/:id', deleteProgram);

module.exports = router;