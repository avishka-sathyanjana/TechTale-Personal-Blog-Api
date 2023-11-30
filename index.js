const express = require('express');
const cors = require('cors');

const User =  require('./models/user');
const Post = require('./models/Post')

const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt =  require('jsonwebtoken');


const cookieParser = require('cookie-parser');

//to handle uploading files
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });

//to rename the file - file system
const fs = require('fs');

const app = express();


const salt = bcrypt.genSaltSync(10); // this is using for the encryption
const secret = 'fkja68956ahndlfn1982456q90hdksfk';

// cors( Cross-Origin Resource Sharing) is crucial when your frontend (React) and 
// backend (Express) are served from different domains,
//  allowing the browser to permit cross-origin requests while maintaining security.
// app.use(cors());

// if we use credentials we need to specify more information
app.use(cors({credentials:true,origin:'http://localhost:3000'}));

// import json parser
app.use(express.json());

// to read the cookies
app.use(cookieParser());

app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect('mongodb+srv://admin:2000@cluster0.exa1cma.mongodb.net/?retryWrites=true&w=majority');

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

  app.post('/login', async (req,res) => {
    const {username,password} = req.body;
    const userDoc = await User.findOne({username});
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      // logged in
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


  // to get the profile information
  app.get('/profile', (req,res) => {
    const {token} = req.cookies;

    //to read the token in a readable format
    jwt.verify(token, secret, {}, (err,info) => {
      if (err) throw err;
      res.json(info);
    });
  });

  //create the logout function
  app.post('/logout', (req,res) => {
    // set the token to an empty string
    res.cookie('token', '').json('ok');
  });


  //create a post
  app.post('/post', uploadMiddleware.single('file'), async (req,res) => {
    
    //to grab the file extension
    const {originalname,path} = req.file;
    //splitting file
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path+'.'+ext;
    
    // rename with file extension
    fs.renameSync(path, newPath);
  
    const {token} = req.cookies;
    
    jwt.verify(token, secret, {}, async (err,info) => {
      if (err) throw err;
      const {title,summary,content} = req.body;

      //creating the post in mongodb
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover:newPath,
        author:info.id,
      });
      res.json(postDoc);
    });
  
  });


  //view all the posts
  app.get('/post', async (req,res) => {
    res.json(
      await Post.find()
        .populate('author', ['username'])
        .sort({createdAt: -1}) //descending
        .limit(20)
    );
  });

  // view one post
  app.get('/post/:id', async (req, res) => {
    
    //grab id from request params
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
  });

app.listen(4000);
