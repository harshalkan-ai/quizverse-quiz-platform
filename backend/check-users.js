const db = require('./config/db');
db.query("SELECT email, name FROM users WHERE role = 'STUDENT'")
    .then(res => {
        console.log("Students in DB:", res.rows.length);
        console.log(res.rows);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
