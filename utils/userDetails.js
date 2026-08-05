import dotenv from 'dotenv';

dotenv.config({ path: process.env.ENV_FILE });

const STANDARD_USER = process.env.STANDARD_USER;
const STANDARD_USER_PASSWORD = process.env.STANDARD_USER_PASSWORD;

export { STANDARD_USER, STANDARD_USER_PASSWORD };
