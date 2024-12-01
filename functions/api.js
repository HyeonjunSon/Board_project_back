const express = require('express');
const serverless = require('serverless-http');
const app = express();
const router = express.Router();

let records = [];

router.get('/', (req,res) => {
    res.send('App is running..');
});

router.post('/add', (req,res) => {
    res.send('New record added.');
});

router.delete('/', (req,res) => {
    res.send('deleted existing record.');
});

router.put('/', (req,res) => {
    res.send('updating existing record.');
});

router.get('/demo', (req,res) => {
    res.json([
        {
            id: '001',
            name: 'hyeonjun',
            email: 'son7523589@gmail.com',
        },
        {
            id: '002',
            name: 'hi',
            email: 'son7523589@gmail.com',
        },
        {
            id: '003',
            name: 'hello',
            email: 'son7523589@gmail.com',
        },
    ]);
});

app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);