require('dotenv').config();

const db_host = process.env.DB_HOST || '127.0.0.1',
      db_port = process.env.DB_PORT || '27017',
      db_name = process.env.DB_NAME || 'test';

const config = {
    secrect: process.env.SECRET,
    port: process.env.PORT || 8000,
    db_url: `mongodb://${db_host}:${db_port}/${db_name}`,
    crit_mass: 200,
    danger_zone: 0.2,
    daily_quote: 500,
    weekly_quote: 3000,
    monthly_quote: 11000,
}

module.exports = config;