// server.js
// require('dotenv').config(); // Uncomment if you have a .env file
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet'); // 1. Import helmet

const app = express();
const PORT = process.env.PORT || 3000;
const PIPEDREAM_URL = process.env.PIPEDREAM_URL || "https://eodglzrh758vzyc.m.pipedream.net";

// --- Middleware ---
app.use(cors());
app.set('trust proxy', true);

// 2. Use helmet to set security headers
// We configure a custom Content Security Policy here
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      // Add other directives here if needed
    },
  })
);


// --- Routes ---
app.get('/view-image/:filename', async (req, res) => {
  const { filename } = req.params;
  const ip = req.ip;
  const headers = req.headers;

  console.log(`Image requested: ${filename} from IP: ${ip}`);

  axios.post(PIPEDREAM_URL, {
    type: 'Image Access',
    filename,
    ip,
    userAgent: headers['user-agent'],
    timestamp: new Date().toISOString(),
  }).catch(error => {
    console.error('Failed to send data to Pipedream:', error.message);
  });

  const imagePath = path.join(__dirname, 'public', 'images', filename);
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).send('Image not found.');
  }
});

// --- Server Start ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});