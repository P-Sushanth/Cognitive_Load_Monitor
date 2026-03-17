const mongoose = require('mongoose');
const User = require('./backend/models/User');
const Task = require('./backend/models/Task');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './backend/.env' });

const seedData = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);

        console.log('Creating Test User...');
        const email = 'viva@demo.com';
        // Cleanup
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            await Task.deleteMany({ user: existingUser.id });
            await User.deleteOne({ _id: existingUser.id });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const user = new User({
            username: 'VivaStudent',
            email: email,
            password: hashedPassword
        });
        await user.save();

        console.log(`User created: ${email} / password123`);

        // Generate Tasks for LAST 4 WEEKS (28 Days)
        const tasks = [];
        const today = new Date();

        const addDays = (date, days) => {
            const result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        };

        // We generate 28 days of data.
        // Week 1 (Oldest): Low Load (Green)
        // Week 2: Medium Load (Yellow)
        // Week 3: High Load (Red)
        // Week 4 (Current): Mixed (Trigger Overload at end)

        const subjects = [
            'Math Homework', 'History Essay', 'Physics Lab Report',
            'Coding Project', 'Literature Reading', 'Chemistry Study',
            'Exam Prep', 'Group Meeting', 'Research Paper'
        ];

        for (let i = 27; i >= 0; i--) {
            const dayOffset = -i; // 0 (Today) to -27
            const date = addDays(today, dayOffset);

            let targetLoad = 200; // Default Low

            // Logic for Load Patterns
            if (i < 7) { // Current Week (0-6 days ago) -> High/Overload
                if (i < 3) targetLoad = 600; // Last 3 days High
                else targetLoad = 300;
            } else if (i < 14) { // Week 2 (-7 to -13) -> High
                targetLoad = 550;
            } else if (i < 21) { // Week 3 (-14 to -20) -> Medium
                targetLoad = 350;
            } else { // Week 4 (-21 to -27) -> Low
                targetLoad = 150;
            }

            // Generate 1-3 tasks per day to match target load
            let currentDayLoad = 0;
            while (currentDayLoad < targetLoad) {
                const subject = subjects[Math.floor(Math.random() * subjects.length)];
                const duration = Math.floor(Math.random() * 60) + 30; // 30-90 mins
                const loadLevel = Math.floor(Math.random() * 3) + 3; // 3-5 level

                // Add some randomness to target load adherence
                if (currentDayLoad + (duration * loadLevel) > targetLoad + 100) break;

                tasks.push({
                    user: user.id,
                    name: subject,
                    duration: duration,
                    loadLevel: loadLevel,
                    date: date
                });
                currentDayLoad += (duration * loadLevel);
            }
        }

        await Task.insertMany(tasks);
        console.log('✅ Tasks seeded successfully for 4 weeks!');

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

seedData();
