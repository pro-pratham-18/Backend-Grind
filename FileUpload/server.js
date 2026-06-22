
require("dotenv").config();

const app=require('./src/app');

const connectDB=require("./src/config/db");

const {cloudinaryConnect} = require("./src/config/cloudinary");

const PORT = process.env.PORT || 3000;

connectDB();
cloudinaryConnect();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

