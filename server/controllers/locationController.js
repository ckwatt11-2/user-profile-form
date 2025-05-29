const locationModel = require('../models/locationModel');

module.exports = {
    getCountries: async (req, res) => {

        try {
            const countries = await locationModel.getCountries();
            res.json(countries);
        }
        catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    getStates: async(req, res) => {
        try{
            const states = await locationModel.getStates();
            res.json(states);
        }
        catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    getCities: async(req, res) => {
        try{
            const cities = await locationModel.getCities();
            res.json(cities);
        }
        catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    },
}