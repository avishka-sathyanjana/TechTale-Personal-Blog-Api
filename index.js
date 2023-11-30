const express = require('express');
const cors = require('cors')
const User =  require('./models/user')
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs')

const app = express();

const salt = bcrypt.genSaltSync(10) // this is using for the encryption

// cors( Cross-Origin Resource Sharing) is crucial when your frontend (React) and 
// backend (Express) are served from different domains,
//  allowing the browser to permit cross-origin requests while maintaining security.
app.use(cors());

// import json parser
app.use(express.json());

mongoose.connect('mongodb+srv://admin:2000@cluster0.exa1cma.mongodb.net/?retryWrites=true&w=majority')

// app.post('/register', async (req,res) => {
//     const {username, password} = req.body;
//     const userDoc = await User.create({username, password});
//     res.json(userDoc);
    
// });

app.post('/register', async (req,res) => {
    const {username,password} = req.body;
    try{
      const userDoc = await User.create({
        username,
        password:bcrypt.hashSync(password,salt),
      });
      res.json(userDoc);
    } catch(e) {
      console.log(e);
      res.status(400).json(e);
    }
  });

app.post('/login', async (req, res) =>{
    const {username, password} = req.body;
    const userDoc = await User.findOne({username})
    // console.log(userDoc)
    const passOk = bcrypt.compareSync(password, userDoc.password)
    if(passOk){
      // console.log("Okey")
    }
    if (passOk) {
        // logged in response with json token
        jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
          if (err) throw err;
          res.cookie('token', token).json({
            id:userDoc._id,
            username,
          });
        });
      } else {
        res.status(400).json('wrong credentials');
      }
    });

app.listen(4000);
