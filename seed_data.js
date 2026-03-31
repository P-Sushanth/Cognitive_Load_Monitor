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

        const tasks = [];
        const today = new Date();

        const addDays = (date, days) => {
            const result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        };

        const subjects = [
            'Math Homework', 'History Essay', 'Physics Lab Report',
            'Coding Project', 'Literature Reading', 'Chemistry Study',
            'Exam Prep', 'Group Meeting', 'Research Paper'
        ];

        for (let i = 27; i >= 0; i--) {
            const dayOffset = -i;
            const date = addDays(today, dayOffset);

            let targetLoad = 200;

            if (i < 7) {
                if (i < 3) targetLoad = 600;
                else targetLoad = 300;
            } else if (i < 14) {
                targetLoad = 550;
            } else if (i < 21) {
                targetLoad = 350;
            } else {
                targetLoad = 150;
            }

            let currentDayLoad = 0;
            while (currentDayLoad < targetLoad) {
                const subject = subjects[Math.floor(Math.random() * subjects.length)];
                const duration = Math.floor(Math.random() * 60) + 30;
                const loadLevel = Math.floor(Math.random() * 3) + 3;

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
