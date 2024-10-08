// pages.js

const express = require('express');
const pages = express();

pages.get('/', (req, res) => {
    res.render('login', { errorMessage: '' });
});

pages.get('/register', (req, res) => {
    res.render('register', { errorMessage: '' });
});

pages.get('/success', (req, res) => {
    res.render('success');
});

pages.get('/forgot', (req, res) => {
    res.render('forgot',{errorMessage:'',Changed:''});
});

pages.get('/admin_login', (req, res) => {
    res.render('admin_login');
});

pages.get('/admin_forgot', (req, res) => {
    res.render('admin_forgot',{errorMessage:'',Changed:''});
});
module.exports = pages;
