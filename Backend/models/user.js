const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        required: true,
        type: String
    },
    role: {
        type: String,
        enum: ['student', 'faculty'],
        default: 'student'
    },
    is_default_password: {
        type: Boolean,
        default: true
    }
});

// Use 'next' to explicitly tell Mongoose when you are done
userSchema.pre('save', async function() {
    const person = this;

    // If password is not modified, move to the next step immediately
    if (!person.isModified('password')) return ;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash(person.password, salt);
        person.password = hashedpassword;
    } catch (error) {
        throw(error); // Pass error to Mongoose
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        // Use 'this.password' (the hashed one from DB)
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (error) {
        throw error;
    }
};

// Renamed 'Student' to 'User' because Faculty will also use this model
const User = mongoose.model('User', userSchema);
module.exports = User;