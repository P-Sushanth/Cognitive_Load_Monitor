const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Task = require('./models/Task');

const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');

        // Find a user to assign tasks to
        const user = await User.findOne();
        if (!user) {
            console.log('No users found. Please register a user first.');
            process.exit(1);
        }

        console.log(`Seeding data for user: ${user.username} (${user.email})`);

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const tasks = [
            // Today's tasks (Overlap scenario)
            {
                user: user._id,
                name: 'Morning Study Session',
                duration: 120,
                loadLevel: 4.5,
                date: today
            },
            {
                user: user._id,
                name: 'Project Meeting',
                duration: 60,
                loadLevel: 3,
                date: today
            },
            {
                user: user._id,
                name: 'Code Review',
                duration: 45,
                loadLevel: 2,
                date: today
            },
            // Yesterday's tasks
            {
                user: user._id,
                name: 'Late Night Coding',
                duration: 180,
                loadLevel: 5,
                date: yesterday
            },
            {
                user: user._id,
                name: 'Documentation',
                duration: 90,
                loadLevel: 4,
                date: yesterday
            }
        ];

        await Task.insertMany(tasks);
        console.log('Test Data Imported!');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
