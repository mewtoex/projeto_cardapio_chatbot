require('dotenv').config(); 
const config = {
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000/api',
    dbPath: process.env.DB_PATH || './bot_messages.db',
};

module.exports = config;