const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const pages = require('./pages');

// express object creation
const app = express();
const port = 3500;

// Database connection configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'hotel',
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// import css files statically
app.use(express.static(__dirname + '/assets/css'));

// express view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// pages.js imported files
app.use('/', pages);

// user_interface
var uname='';
app.get('/user_interface', (req, res) => {
    res.render('user_interface', {Username:uname});
});

// register page submission form
app.post('/submit', (req, res) => {
    const { username, email, phone, password, confirmPassword } = req.body;

    // Check if the user already exists with the same username or email
    checkUserExists(username, email)
        .then((userExists) => {
            if (userExists) {
                res.render('register', { errorMessage: 'User with the same username or email already exists.' });
            } else if (password !== confirmPassword) {
                res.render('register', { errorMessage: 'Password and Confirm Password do not match.' });
            } else {
                // Insert data into the database
                pool.query(
                    'INSERT INTO user (username, email, phone, password) VALUES (?, ?, ?, ?)',
                    [username, email, phone, password],
                    (error, results) => {
                        if (error) {
                            console.error('Error inserting data:', error.message);
                            res.status(500).send('Internal Server Error');
                        } else {
                            // console.log('inserted successfully!');
                            res.redirect('success');
                        }
                        res.end();
                    }
                );
            }
        })
        .catch((error) => {
            console.error('Error checking user:', error.message);
            res.status(500).send('Internal Server Error');
        });
});

function checkUserExists(username, email) {
    return new Promise((resolve, reject) => {
        // Check if the user with the same username or email exists in the database
        pool.query(
            'SELECT * FROM user WHERE username = ? OR email = ?',
            [username, email],
            (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    // If results array has any length, the user already exists
                    resolve(results.length > 0);
                }
            }
        );
    });
}



// login page code

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    uname = username;
    // Check if the entered username and password match a user in the database
    checkLoginCredentials(username, password)
        .then((loginSuccessful) => {
            if (loginSuccessful) {
                res.redirect('/user_interface');
            } else {
                res.render('login', { errorMessage: 'Invalid username or password.' });
            }
        })
        .catch((error) => {
            console.error('Error checking login credentials:', error.message);
            res.status(500).send('Internal Server Error');
        });
});


function checkLoginCredentials(username, password) {
    return new Promise((resolve, reject) => {
        // Check if the entered username and password match a user in the database
        pool.query(
            'SELECT * FROM user WHERE username = ? AND password = ?',
            [username, password],
            (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    // If results array has any length, login is successful
                    resolve(results.length > 0);
                }
            }
        );
    });
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


