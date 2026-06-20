const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");      // must do this when fethcing the cookie from the parser 

const router = require('./routes/route')

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());                        // this is used to parse the cookies
app.use(router);                                // gpt bol raha hai router wale middleware ko last me hi rakhte hai

module.exports = app;











