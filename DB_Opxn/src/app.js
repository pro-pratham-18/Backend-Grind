const express = require('express');
const cors = require('cors');

const noteModel = require("./models/note.model");
const app = express();

app.use(cors());
app.use(express.json());

app.get('/pokedex/get', async (req, res) => {
    const pokedex= await noteModel.find();

    console.log("Get Request Hit...");
    res.json({
        message:"Data fetched Successfully",
        data : pokedex
    });
});

app.post('/pokedex/post', async (req, res) => {
    try{
        //some ways of extracting the data and posting it to the database

        // const {username,email,age} = req.body;                   //1
        // const myuser = new noteModel({username,email,age});
        //         //updation on property(username,email....) can be done here
        // await myuser.save();                                     // for this case, use myuser variable in reponse below


        // const user=req.body;                                      //2
        // const myuser = new noteModel(req.body);
        // await myuser.save();                                      // for this case , use myuser variable in response below


        const user=req.body;                                         //3
        const newuser = await noteModel.create({                     // here newuser stores exactly that data which is going to be posted on the database(including the deafault properties) thats why i created it , as when i was using data:user in response , on the req body was getting shown in the response(without the default properties)
            username:user.username,                                  // updation on the property can be done here,can be done for other prooperty as well below
            email:user.email,
            age:user.age,                                            // for this case , use newuser variable im response below 
        })
        // 1 and 3 are generally used in production

    res.json({
        message: 'posted successfully',
        data: newuser
    });
    }
    catch(err){
        res.status(500).json({
            message:"Error detected at server"
        })
    }
});

app.put('/pokedex/put/:id',async (req,res)=>{
    try{
        const {id}=req.params;
        const {username,email,age}= req.body;
        const newnote = await noteModel.findByIdAndUpdate(id,{username,email,age},   // all the sent property will get applied
        {
            returnDocument:'after', // as we want the documnet after updation 
            runValidators: true     // for update commands schema calidation can be skipped so we can use this , to validate the proper schema and constraints , used in production as well
        }
        );
        if(!newnote){
            res.status(404).json({
                message :"Error 404  Not Found"
            })
        }
        res.json({
            message :"update successful",
            UpdatedData: newnote
        })
    }
    catch(err){
        console.log("error occured");
        res.status(500).json({
            message:"Internal Server Errror Occured"
        })
    }
})

app.delete('/pokedex/delete/:id', async(req,res)=>{
    try{
        const {id}= req.params;
        const note = await noteModel.findOneAndDelete(id);    // note is storing the deleted document
        
        if(!note){[                    // remember to add this code block in delete and update request , well it is basically for the condition when the entered it id is not present in the database
            res.status(404).json({
                message:"Error 404 Not Found"
            })
        ]}

        res.status(200).json({
            message:"The below Document has been deleted successfully ",
            data : note
        })
    }
    catch(err){
        res.status(500).json({
            message:"Internal Server Error" 
        })
    }
})

module.exports = app;









