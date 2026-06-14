const express = require('express');
const cors = require('cors');

const router=require('../routes/route')

const app = express();



//custom middlewares 




// app.use() ,this is called loading middleware into application 



//third party middleware
app.use(cors());

//built in middlewares
app.use(express.json());


//route specific middleware
app.use(router);  // i can add a particular route after which it will run , example - app.use("/api",router); now it will run on /api/student and /api/admin


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
