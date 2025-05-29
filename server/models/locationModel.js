const { getDB } = require('../config/db');

const locationModel = {

    async getCountries() {
        
        const db = getDB();
        return db.collection('countries').find().toArray();

    },

    async getStates(countryId) {
        const db = getDB();
        return db.collection('states').find({ country_id: countryId }).toArray();
    },

    async getCities(stateId) {
        const db = getDB();
        return db.collection('cities').find( {state_id: stateId }).toArray();
    }

};

module.exports = locationModel;