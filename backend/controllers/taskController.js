const Task = require('../models/Task');

// Create a Task
exports.createTask = async (req, res) => {
    const { name, duration, loadLevel, date } = req.body;
    try {
        const newTask = new Task({
            user: req.user.id,
            name,
            duration,
            loadLevel,
            date: date || Date.now()
        });
        const task = await newTask.save();
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get All Tasks for logged in user
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id }).sort({ date: -1 });
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete Task
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        // Check user
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await task.deleteOne();
        res.json({ msg: 'Task removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
// Update Task
exports.updateTask = async (req, res) => {
    const { name, duration, loadLevel, date } = req.body;

    // Build task object
    const taskFields = {};
    if (name) taskFields.name = name;
    if (duration) taskFields.duration = duration;
    if (loadLevel) taskFields.loadLevel = loadLevel;
    if (date) taskFields.date = date;

    try {
        let task = await Task.findById(req.params.id);

        if (!task) return res.status(404).json({ msg: 'Task not found' });

        // Make sure user owns task
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        task = await Task.findByIdAndUpdate(
            req.params.id,
            { $set: taskFields },
            { new: true }
        );

        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
