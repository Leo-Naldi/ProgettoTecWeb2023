/**
* Bakend configuration module.
*
* @module config/index
*/

const path = require("path");

let rootPath = path.resolve(__dirname, "..");

require("dotenv").config({ path: path.join(rootPath, '.env') });

const env = process.env.ENVIRONMENT || 'local';

/** Database connection values */
const db_host = process.env.DB_HOST || "127.0.0.1",
  db_port = process.env.DB_PORT || "27017",
  db_name = process.env.DB_NAME || "TecWebDB",
  db_username = process.env.DB_USERNAME || null,
  db_password = process.env.DB_PASSWORD || null,
  db_site = process.env.DB_SITE || null;
 
/**
 * Tests use a different db as to not disturb the main database.
 */
const db_test_name = process.env.DB_TEST_NAME || "TecWebDBTest";

const crit_mass_base = 200;
const danger_zone = 0.2;
const fame_zone = 0.25;

const folder = path.join(rootPath, "files"); // static folder: backend/files

/**
 * @namespace
 * @constant
 */
const config = {

  /**
   * Environment type
   * @type {('local'|'deploy')}
   */
  env: env,

  /**
   * Server secret, used to create and validate tokens
   * @type {number}
   */
  secrect: process.env.SECRET,
  /**
   * Backend Port
   * @type {number}
   * @default 8000
   */
  port: process.env.PORT || 8000,
  /**
   * MongoDB docker credentials
   * @type {object}
   */
  db_credentials: {
    username: db_username,
    site: db_site,
    password: db_password,
  },
  /**
   * DB url
   * @type {string}
   */
  db_url: (env === 'deploy') ? 
    `mongodb://${db_username}:${db_password}@${db_site}/${db_name}?authSource=admin&writeConcern=majority`: 
    `mongodb://${db_host}:${db_port}/${db_name}`,
  /**
   * Test DB url
   * @type {string}
   */
  db_test_url: (db_username) ?
    `mongodb://${db_username}:${db_password}@${db_host}/${db_test_name}` :
    `mongodb://${db_host}:${db_port}/${db_test_name}`,
  /**
   * @type {number}
   */
  danger_threshold: Math.floor(crit_mass_base * danger_zone),
  /**
   * @type {number}
   */
  fame_threshold: Math.floor(crit_mass_base * fame_zone),
  /**
   * User default daily quote of characters
   * @type {number}
   */
  daily_quote: 500,
  /**
   * User default weekly quote of characters
   * @type {number}
   */
  weekly_quote: 3000,
  /**
   * User default monthly quote of characters
   * @type {number}
   */
  monthly_quote: 11000,
  /**
   * @type {number}
   */
  default_client_error: 409,
  /**
   * @type {number}
   */
  default_success_code: 200,
  /**
   * Number of messages returned in each page of GET results
   * @type {number}
   */
  results_per_page: 100,
  /**
   * @type {number}
   */
  num_messages_reward: 10,
  folder: folder,
  log_level: process.env.LOG_LEVEL,
  /* i've tested this part with my google mail account and it works */
  mail_user: process.env.MAIL_USER, // your mail for send mail to user
  mail_password: process.env.MAIL_PASSWORD, // your mail account password
  mail_service: process.env.MAIL_SERVICE, // nodemailer default supported mail: [Well-known services – Nodemailer](https://community.nodemailer.com/2-0-0-beta/setup-smtp/well-known-services/)
  mail_host: process.env.MAIL_HOST, // if not listed in mail_service
  /**
   * Log files directory
   * @type {string}
   */
  logs_dir: path.join(rootPath, 'logs'),
  smmdashboard_build_path: path.resolve(rootPath, '..', 'smmdashboard', 'build'),
  moddashboard_build_path: path.resolve(rootPath, '..', 'moddashboard'),
  app_build_path: path.resolve(rootPath, '..', 'myapp_v2.1', 'dist', 'spa'),
  app_static_path: path.resolve(rootPath, '..', 'myapp_v2.1', 'src', 'assets'),

};

module.exports = config;
 