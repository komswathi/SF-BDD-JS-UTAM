require('dotenv').config({ path: process.env.ENV_FILE });

const STANDARD_USER = process.env.STANDARD_USER;
const STANDARD_USER_PASSWORD = process.env.STANDARD_USER_PASSWORD;

module.exports = {
    STANDARD_USER,
    STANDARD_USER_PASSWORD
};
