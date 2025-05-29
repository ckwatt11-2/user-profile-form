const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const locationController = require('../controllers/locationController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/check-username', userController.checkUsername);
router.get('/countries', locationController.getCountries);
router.get('/states', locationController.getStates);
router.get('/cities', locationController.getCities);

router.post('/update-profile', 
    auth, 
    upload.uploadFile,
    userController.updateProfile
);

router.use((err, req, res, next) => {
    if (err) {
        return res.status(400).json({
            error: err.message || 'File upload failed'
        });
    }
    next();
});

module.exports = router;