/**
 * Bakend configuration module.
 *
 * @module config/index
 */

 require("dotenv").config();
 const path = require("path");
 
 /** Database connection values */
 const db_host = process.env.DB_HOST || "127.0.0.1",
   db_port = process.env.DB_PORT || "27017",
   db_name = process.env.DB_NAME || "TecWebDB";
 
 /**
  * Tests use a different db as to not disturb the main database.
  */
 const db_test_host = process.env.DB_TEST_HOST || "127.0.0.1",
   db_test_port = process.env.DB_TEST_PORT || "27017",
   db_test_name = process.env.DB_TEST_NAME || "TecWebDBTest";
 
 const crit_mass_base = 200;
 const danger_zone = 0.2;
 const fame_zone = 0.25;
 
 let rootPath = path.resolve(__dirname, "..");
 const folder = path.join(rootPath, "files"); // static folder: backend/files
 
 /**
  * @namespace
  * @constant
  */
 const config = {
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
    * DB url
    * @type {string}
    */
   db_url: `mongodb://${db_host}:${db_port}/${db_name}`,
   /**
    * Test DB url
    * @type {string}
    */
   db_test_url: `mongodb://${db_test_host}:${db_test_port}/${db_test_name}`,
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
    * Number of messages returned in each page of results, see {@link }
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
   mail_user: '', // your mail for send mail to user
   mail_password: ' ', // your mail account password
   mail_service: '', // nodemailer default supported mail: [Well-known services – Nodemailer](https://community.nodemailer.com/2-0-0-beta/setup-smtp/well-known-services/)
   mail_host: '', // if not listed in mail_service
 };
 
 module.exports = config;
 