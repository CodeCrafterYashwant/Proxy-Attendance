const express = require('express');
const app = express();
const db = require('./db');  
require('dotenv').config();
const cors = require('cors'); // <--- IMPORT THIS

const bodyParser = require('body-parser');
app.use(bodyParser.json());

// --- CRITICAL FIX: ENABLE CORS HERE ---
// This allows your frontend (port 5173) to talk to this backend (port 3000)
app.use(cors()); 
// --------------------------------------

const {jwtAuthMiddleware} = require('./jwt');

const PORT = process.env.PORT || 3000; 

const userRoutes = require('./Routes/userRoutes');
const attendanceRoutes = require('./Routes/attendanceRoutes');

app.use('/user', userRoutes);
app.use('/attendance', attendanceRoutes);

app.listen(PORT,()=>{
    console.log("listing on port:",PORT);
});