require('dotenv').config();
const { MongoClient } = require('mongodb');
const countries = require('./data/countries.json');
const states = require('./data/states.json');
const cities = require('./data/cities.json');

async function seedDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {

    await client.connect();
    const db = client.db(process.env.DB_NAME);
    
    await db.collection('countries').insertMany(countries);
    console.log(`Inserted ${countries.length} countries`);
   
    await db.collection('states').insertMany(states);
    console.log(`Inserted ${states.length} states`);
    
    await db.collection('cities').insertMany(cities);
    console.log(`Inserted ${cities.length} cities`);

  } 
  catch (err) {

    console.error('Seeding error:', err);

  } 

  finally {

    await client.close();
    
  }
}

seedDatabase();