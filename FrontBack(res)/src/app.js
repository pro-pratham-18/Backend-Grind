const express = require('express');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    console.log("Get Request Hit");
    res.json([
        {
            id:1,
            name:"prathamesh",
            age:20,

        },
        {
            id:2,
            name:"mohan",
            age:25,

        },
        {
            id:3,
            name:"sohan",
            age:19,

        }
    ]);
});

app.post('/post', (req, res) => {
    const user = req.body;
    console.log(user);

    res.json({
        message: 'post request successfull',
        data: user
    });
});

module.exports = app;
