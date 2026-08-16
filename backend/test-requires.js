function log(msg) {
    process.stdout.write(msg + '\n');
}

log('1. Loading pg...');
const { Pool } = require('pg');
log('2. pg loaded.');

log('3. Loading db config...');
const db = require('./config/db');
log('4. db config loaded.');

log('5. Loading authController...');
const auth = require('./controllers/authController');
log('6. authController loaded.');

log('7. Loading aiController...');
const ai = require('./controllers/aiController');
log('8. aiController loaded.');

log('🎉 ALL LOADED SUCCESSFULLY!');
process.exit(0);
