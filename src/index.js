import dotenv from 'dotenv';
import mongoose, { connect } from 'mongoose';
import {DB_NAME} from "./constants.js"
import connectDB from './db/index.js';
// require('dotenv').config({path : './env'});

dotenv.config({
    path : './env'    // path to .env file. .env file is in the same directory as index.js
});



connectDB()
.then(() =>{
    app.listen(process.env.PORT || 8000, () =>{
        console.log(`Server is running on port ${process.env.PORT}`);
    })
})

.catch((err) => {
    console.log("MONGO DB connection failed", err);
    
})
 



  
  

 



// import express from 'express';

// const app  = express();
// ; ( async() => {

//     try{
//        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)

//        app.on("error", (error) => {
//         console.log("Error in connecting to Database");
//         throw error;
        
//        })

//        app.listen(process.env.PORT, () => {
//         console.log(`App is listning on port ${process.env.PORT}`);
        
//        })
//     }

//     catch(error){
//         console.log("Error : " , error);
        
//     }

// } )()    // IIFE, Immediately Invoked Function Expression