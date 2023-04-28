require('dotenv').config();

const db_host = process.env.DB_HOST || '127.0.0.1',
      db_port = process.env.DB_PORT || '27017',
      db_name = process.env.DB_NAME || 'test';

const config = {
    secrect: process.env.SECRET,
    port: process.env.PORT || 8000,
    db_url: `mongodb://${db_host}:${db_port}/${db_name}`,
    crit_mass: Number(process.env.CRIT_MASS) || 100,
    danger_zone: parseFloat(process.env.DANGER_ZONE) || 0.2,
}

module.exports = config;