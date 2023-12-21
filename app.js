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
let usname=uname;
app.get('/user_interface', (req, res) => {
    res.render('user_interface', {Username:uname});
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

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


