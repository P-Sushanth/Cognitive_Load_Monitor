const Task = require('../models/Task');
// const moment = require('moment');

const OVERLOAD_THRESHOLD = 500; // Define threshold

// Helper to calculate load for a specific date range
const calculateLoad = async (userId, startDate, endDate) => {
    const tasks = await Task.find({
        user: userId,
        date: { $gte: startDate, $lt: endDate }
    });
    return tasks.reduce((total, task) => total + (task.duration * task.loadLevel), 0);
};

// Daily Load (Single Day - Today)
exports.getDailyLoad = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const load = await calculateLoad(req.user.id, today, tomorrow);
        res.json({ date: today.toISOString(), totalLoad: load });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Daily History (Last 7 Days) - For Line Chart
exports.getDailyHistory = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const data = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const nextD = new Date(d);
            nextD.setDate(d.getDate() + 1);

            const dayLoad = await calculateLoad(req.user.id, d, nextD);
            data.push({ date: d.toISOString().split('T')[0], load: dayLoad });
        }
        res.json(data);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Weekly Load (Last 4 Weeks Average) - For Bar Chart
exports.getWeeklyLoad = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weeksData = [];

        for (let w = 0; w < 4; w++) {
            const weekEnd = new Date(today);
            weekEnd.setDate(weekEnd.getDate() - (w * 7));

            const weekStart = new Date(weekEnd);
            weekStart.setDate(weekStart.getDate() - 6);
            weekStart.setHours(0, 0, 0, 0);

            const tasks = await Task.find({
                user: req.user.id,
                date: { $gte: weekStart, $lt: new Date(weekEnd.getTime() + 86400000) }
            });

            const totalWeekLoad = tasks.reduce((total, task) => total + (task.duration * task.loadLevel), 0);
            const avgDailyLoad = totalWeekLoad / 7;

            weeksData.unshift({
                weekLabel: w === 0 ? 'Current Week' : `${w} Week${w > 1 ? 's' : ''} Ago`,
                averageLoad: Math.round(avgDailyLoad)
            });
        }

        res.json(weeksData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Overload Status
exports.checkOverload = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let consecutiveDays = 0;
        const daysToCheck = 3;

        for (let i = 0; i < daysToCheck; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const nextD = new Date(d);
            nextD.setDate(d.getDate() + 1);

            const load = await calculateLoad(req.user.id, d, nextD);
            if (load > OVERLOAD_THRESHOLD) {
                consecutiveDays++;
            } else {
                break; // consecutive broken
            }
        }

        const isOverload = consecutiveDays === 3;
        res.json({ isOverload, consecutiveDays });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
