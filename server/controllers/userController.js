const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

const validatePassword = (password) => {
    const hasNum = /\d/.test(password);
    const hasSpec = /[!@#$%^&*]/.test(password);
    return password.length >= 8 && hasNum && hasSpec;
};

module.exports = {
    checkUsername: async (req, res) => {
        try { 
            const user = await userModel.usernameExists(req.query.username);
            res.json( { available: user });
        }
        catch (err) {
            res.status(500).json({ error : 'Server error' });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id; 
            const updateData = req.body; 
            const fileData = req.file;
            

            const errors = {}

            if (updateData.username && updateData.username.length < 4) {
                errors.username = 'Must be 4-20 characters long.';
            }
            if (updateData.newPassword && !validatePassword(password)){
                errors.password = 'Not a valid password (does not contain 8+ chars with atleast one number and one special character)';
            }
            if (Object.keys(errors).length > 0) {
                return res.status(400).json({ errors });
            }
            if (updateData.newPassword) {
                const user = await userModel.getUserById(userId);
                const matches = await bcrypt.compare(updateData.currentPassword, user.password);

                if (!matches) {
                    return res.status(400).json({ error: 'Current password is incorrect' });
                }

                const salt = await bcrypt.genSalt(10);
                updateData.password = await bcrypt.hash(updateData.newPassword, salt);
                delete updateData.currentPassword;
                delete updateData.newPassword;
            }

            if (fileData) {
                updateData.profilePhoto = `/uploads/${fileData.filename}`;
            }
            
            const { username, currentPassword, newPassword } = req.body;
            const result = await userModel.updateUser(userId, updateData); // finally, make changes to user profile
            

            if (result > 0) {
                res.json({ success: true });
            }
            else {
                res.status(400).json({ error: 'User not found'});
            }
        }
        catch (err){
            res.status(500).json({ error: 'Server error' });
        }
    }
};