require('dotenv').config();

const db_host = process.env.DB_HOST || '127.0.0.1',
      db_port = process.env.DB_PORT || '27017',
      db_name = process.env.DB_NAME || 'TecWebDB';

const db_test_host = process.env.DB_TEST_HOST || '127.0.0.1',
    db_test_port = process.env.DB_TEST_PORT || '27017',
    db_test_name = process.env.DB_TEST_NAME || 'TecWebDBTest';

const crit_mass = 200, danger_zone = 0.2, fame_zone = 0.25;

const config = {
    secrect: process.env.SECRET,
    port: process.env.PORT || 8000,
    db_url: `mongodb://${db_host}:${db_port}/${db_name}`,
    db_test_url: `mongodb://${db_test_host}:${db_test_port}/${db_test_name}`,
    crit_mass: crit_mass,
    danger_zone: danger_zone,
    fame_zone: fame_zone,
    danger_threshold: Math.floor(crit_mass * danger_zone),
    fame_threshold: Math.floor(crit_mass * fame_zone),
    daily_quote: 500,
    weekly_quote: 3000,
    monthly_quote: 11000,
    default_client_error: 409,
    default_success_code: 200,
    results_per_page: 100,
    reactions_reward_threshold: 100,   // increase or decrease characters every 100 pos/neg reactions
    reactions_reward_amount: 10,   // number of chars to be added/removed
}

module.exports = config;