**Hotel Management System**
This is a simple hotel management system built using Node.js, Express, MySQL, and Handlebars.

**Table of Contents**
1.Features
2.Prerequisites
3.Installation
4.Usage
5.Database Setup
6.Configuration

**Features**
1.User registration and login
2.Room booking and payment
3.Admin panel to manage bookings
4.Display of today's bookings and income

**Prerequisites**
Node.js and npm installed
MySQL database
Git (optional)

**Installation**
Clone the repository: git clone https://github.com/your-username/hotel-management.git
Or download the ZIP file and extract it.

**Install dependencies:**
npm install

**Usage**
1.Start the application: npm start
2.The application will be accessible at http://localhost:3500.
3.Access the admin panel at http://localhost:3500/admin.

**Database Setup**
Create a MySQL database named 'hotel'.
Import the provided SQL file to set up the necessary tables: mysql -u your-username -p hotel < database.sql
Update the dbConfig in app.js with your MySQL credentials.

**Configuration**
Update dbConfig in app.js with your MySQL database credentials.
