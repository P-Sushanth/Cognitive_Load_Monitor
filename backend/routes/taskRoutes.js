const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const taskController = require('../controllers/taskController');

router.post('/', auth, taskController.createTask);
router.get('/', auth, taskController.getTasks);
router.delete('/:id', auth, taskController.deleteTask);
router.put('/:id', auth, taskController.updateTask);

module.exports = router;
