// const notes=[];                          // notes array created for method requests testing witout database(mongoDB)                     


// app.get('/notes',(req,res)=>{              // get request
//     console.log("get request hit hogyi ");
//     console.log(req.method);
//     res.status(200).json({
//         message:"Get Request Successfull",
//         notes:notes
//     });
// });

// app.post('/notes',(req,res)=>{             //post request 
//     console.log("post request hit hogyi ");
//     notes.push(req.body);
//     console.log(req.method);
//     console.log(req.body);
//     res.json({
//         message:" PostRequest sucessfull",
//         notes:notes
//     });

// });

// app.delete('/notes/:index',(req,res)=>{        // delete request
//     const index=req.params.index;
//     notes.splice(index,1);
//     console.log(notes);
//     res.json({
//         message:"note deleted successfully", 
//         note:notes
//     })
// });
//     //pnt: to restart the server after doing changes , use command npx nodeman server.js, after changes just press ctrl+s for restarting server

//     //using splice changes indexes of the note at every deletion step

// app.patch('/notes/:index',(req,res)=>{           // patch request 
//     const index=req.params.index;
//     const description=req.body.description;
//     notes[index].description=description;
//     res.json({
//         message:"updation successful", 
//         notes:notes
//     })
//     });

// module.exports=app;