const mongoose = require('mongoose');
require('dotenv').config();



// const mongoURL = process.env.MONGODB_URL_LOCAL;
const mongoURL = process.env.MONGODB_URL;


mongoose.connect(mongoURL);

 

const db = mongoose.connection;

db.on('connected',()=>{
    console.log('Conncected to MongoDB server');
});
db.on('error',(err)=>{
    console.error('MongoDB connection error: ',err);
});
db.on('disconnected',()=>{
    console.log("MongoDB disconnected");
});

//export the database conncection
module.exports = db;