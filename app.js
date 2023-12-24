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
let uname='';
app.get('/user_interface', (req, res) => {
    // fetch details from bookings table to displaying
    pool.query('SELECT username, room_type, check_in_date, check_out_date, number_of_guest, no_of_days ,Amount FROM booking where username =?',[uname], (error, results) => {
        if (error) {
            console.error('Error fetching user data:', errorUser.message);
            res.status(500).send('Internal Server Error');
            return;
        }
    res.render('user_interface',{bookings:results,Username:uname});
});
});

// payment and booking
   let Username='';
   let RoomType='';
   let Check_In_Date='';
   let Check_Out_Date='';
   let Guests='';
   let No_of_days='';
   let price_Per_Night='';
   let Total_Price='';
   let Refrence_number ='';

// payments page and booking confirmation
app.get('/booking_payment',(req,res)=>{
    res.render('booking_payment',{Username,RoomType,Check_In_Date,Check_Out_Date,Guests,price_Per_Night,Total_Price,No_of_days});
});

// payment refrence number slip
app.get('/booking_success',(req,res)=>{
    res.render('booking_success',{Username,RoomType,Check_In_Date,Check_Out_Date,Guests,price_Per_Night,Total_Price,No_of_days,Refrence_number});
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
    // console.log("its work");
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
    // console.log(username+" "+password);
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

// booking form
app.post('/book', (req, res) => {
    const { username, roomType, checkInDate, checkOutDate, guests } = req.body;
    let pricePerNight = 0;
    // room room price checking
    if(roomType=='Deluxe Room') pricePerNight =  2500;
    if(roomType=='Executive Suite') pricePerNight = 4000;
    if(roomType=='Non Ac Room') pricePerNight =  1000;
    // days calculation
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const numberOfNights =Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    // day = 0 mean consider to day = 1
    let totalPrice = 0;
    if(numberOfNights == 0){
        totalPrice = pricePerNight * 1;
        No_of_days = 1;
    }
    else{
        totalPrice = numberOfNights * pricePerNight;
        No_of_days = numberOfNights;
    }
    // initialization
    Username= username;
    RoomType= roomType;
    Check_In_Date= checkInDate;
    Check_Out_Date= checkOutDate;
    Guests= guests;
    price_Per_Night= pricePerNight;
    Total_Price= totalPrice;
    // refrencenumber generation
    function Random_Number() {
         return Math.floor(Math.random()*(9999999999999999 - 1000000000000000 + 1)) + 1000000000000000;
    }
    Refrence_number = Random_Number();

    res.redirect('/booking_payment');
});

// confirm payment
app.post('/confirm_payment',(req,res)=>{
    // Insert data into the database
    pool.query(
        'INSERT INTO booking (username, room_type, check_in_date, check_out_date, number_of_guest, no_of_days, Amount, refrence_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [Username, RoomType, Check_In_Date, Check_Out_Date, Guests, No_of_days, Total_Price, Refrence_number],
        (error, results) => {
            if (error) {
                console.error('Error inserting data:', error.message);
                res.status(500).send('Internal Server Error');
            } else {
                console.log('Booking data inserted successfully!');
                // Render the booking success page with data
                res.redirect('/booking_success');
            }
            res.end();
        }
    );
});

// Admin page login
app.post('/admin_login', (req, res) => {
    const { username_admin, password_admin } = req.body;
    // uname = username;
    // Check if the entered username and password match a user in the database
    checkAdminCredentials(username_admin, password_admin)
        .then((loginSuccessful) => {
            if (loginSuccessful) {
                res.redirect('/admin');
            } else {
                res.render('admin_login', { errorMessage: 'Invalid username or password.' });
            }
        })
        .catch((error) => {
            console.error('Error checking admin credentials:', error.message);
            res.status(500).send('Internal Server Error');
        });
});

function checkAdminCredentials(username_admin, password_admin) {
    return new Promise((resolve, reject) => {
        // Check if the entered username and password match a user in the database
        pool.query(
            'SELECT * FROM admin WHERE username = ? AND password = ?',
            [username_admin, password_admin],
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

// today booking
let Today_booking = 0;

// today income
let Today_revenue = 0;

// Route to display booking and user details in admin page
app.get('/admin', (req, res) => {
    // Get the count of rows
    const count = 'SELECT COUNT(*) AS row_count FROM booking';

    // Get the sum of today's income
    const todayIncome = 'SELECT SUM(Amount) AS total_Amount FROM booking';

    // Execute the query for count
    pool.query(count, (errorCount, resultsCount) => {
        if (errorCount) {
            console.error('Error executing count query:', errorCount.message);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Count from the results
        const rowCount = resultsCount[0].row_count;
        Today_booking = rowCount;

        // Execute the query for sum of today's income
        pool.query(todayIncome, (errorIncome, resultsIncome) => {
            if (errorIncome) {
                console.error('Error executing today\'s income query:', errorIncome.message);
                res.status(500).send('Internal Server Error');
                return;
            }

            // Access the sum from the results
            const total_Amount = resultsIncome[0].total_Amount;
            Today_revenue = total_Amount;

            // Fetch booking details from the database
            pool.query('SELECT * FROM booking', (errorBooking, resultsBooking) => {
                if (errorBooking) {
                    console.error('Error fetching booking data:', errorBooking.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }

                // Fetch user details from the database
                pool.query('SELECT userid, username, email, phone FROM user', (errorUser, resultsUser) => {
                    if (errorUser) {
                        console.error('Error fetching user data:', errorUser.message);
                        res.status(500).send('Internal Server Error');
                        return;
                    }

                    // Render the 'admin' template and pass both sets of data
                    res.render('admin', { bookings: resultsBooking, user: resultsUser, Today_booking, Today_revenue });
                });
            });
        });
    });
});

// forgot password
app.post('/forgot', (req, res) => {
    const { email, password } = req.body;

    // Check if the email exists
    const check_email = 'SELECT * FROM user WHERE email = ?';
    const update_password = 'UPDATE user SET password = ? WHERE email = ?';

    pool.query(check_email, [email], (checkError, checkResults) => {
        if (checkError) {
            console.error(checkError);
            res.status(500).send('Internal Server Error');
        } else if (checkResults.length === 0) {
            // Email doesn't exist
            res.render('forgot', { errorMessage: 'Email not found' });
        } else {
            // Update the password (assuming password is hashed in a real-world scenario)
            pool.query(update_password, [password, email], (updateError, updateResults) => {
                if (updateError) {
                    console.error(updateError);
                    res.status(500).send('Internal Server Error');
                } else {
                    console.log('Password change successful');
                    res.render('forgot', { Changed: 'Password change successful'});
                }
            });
        }
    });
});

// admin forgot password
app.post('/admin_forgot', (req, res) => {
    const { admin_email, admin_password } = req.body;

    // Check if the email exists
    const check_email = 'SELECT * FROM admin WHERE email = ?';
    const update_password = 'UPDATE admin SET password = ? WHERE email = ?';

    pool.query(check_email, [admin_email], (checkError, checkResults) => {
        if (checkError) {
            console.error(checkError);
            res.status(500).send('Internal Server Error');
        } else if (checkResults.length === 0) {
            // Email doesn't exist
            res.render('admin_forgot', { errorMessage: 'Email not found' });
        } else {
            // Update the password (assuming password is hashed in a real-world scenario)
            pool.query(update_password, [admin_password, admin_email], (updateError, updateResults) => {
                if (updateError) {
                    console.error(updateError);
                    res.status(500).send('Internal Server Error');
                } else {
                    console.log('Password change successful');
                    res.render('admin_forgot', { Changed: 'Password change successful'});
                }
            });
        }
    });
});



// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


