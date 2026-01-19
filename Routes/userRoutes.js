const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { jwtAuthMiddleware, generateToken } = require('../jwt');

// 1. SIGNUP (Admin or Faculty creates Student accounts)
// routes/userRoutes.js

router.post('/signup', async (req, res) => {
    try {
        // 1. Get the data from the request
        // We use spread syntax {...req.body} to make a copy we can modify safely
        const data = req.body; 

        // 2. THE FIX: Check if password exists. If not, add it to 'data' NOW.
        if (!data.password) {
            data.password = '12345';
        }

        // 3. Create the User using the 'data' which now DEFINITELY has a password
        const newUser = new User(data);

        // 4. Save (Now Mongoose will be happy because password exists)
        const response = await newUser.save();
        console.log('User saved');

        res.status(200).json({ response: 'ok' });

    } catch (err) {
        console.log(err);
        if (err.code === 11000) {
            res.status(400).json({ message: 'Email already exists.' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// 2. LOGIN (With "Default Password" Check)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email });

        // If user not found or password doesn't match
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Generate Token
        const payload = {
            id: user.id,
            role: user.role
        };
        const token = generateToken(payload);

        // CHECK: Is this the first time login?
        if (user.is_default_password) {
            return res.status(200).json({
                message: "Login successful. Please change your password immediately.",
                requirePasswordChange: true,
                token: token
            });
        }

        // Normal Login
        res.json({ 
            message: "Login successful",
            requirePasswordChange: false,
            token: token 
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 3. CHANGE PASSWORD (Required if is_default_password is true)
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Got from the Token
        
        // Extract both the OLD password (to verify) and the NEW password
        const { currentPassword, newPassword } = req.body; 

        // 1. Find the User
        const user = await User.findById(userId);
        if(!user){
             return res.status(404).json({ message: 'User not found' });
        }
        console.log(user);

        // 2. SECURITY CHECK: Check if the 'currentPassword' matches the DB
        // You cannot just let them change it without proving they know the old one!
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid current password' });
        }

        // 3. Update the password
        // Your User model's 'pre-save' hook will automatically hash this new password
        user.password = newPassword;
        user.is_default_password = false; // Turn off the flag
        
        await user.save();

        console.log('Password updated');
        res.status(200).json({ message: 'Password updated successfully' });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 4. GET PROFILE (To see my own details)
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = await User.findById(req.user.id);
        res.status(200).json({ user: userData });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;