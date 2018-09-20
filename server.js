const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI)

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


var user =  require('./myApp.js').user;
var createUser = require('./myApp.js').createUser;
var findUser = require('./myApp.js').findUser;
var findUserById = require('./myApp.js').findUserById;

app.post('/api/exercise/new-user', function(req,res,next){
  var username = req.body.username;
  
  findUser(username, function(err,data){
    if(err) { return next(err) }
    if(!data) {
      createUser(username, function(err,data){
        if(err) { return next(err) }
        res.json({username: data.username, _id: data._id});
      });
      //return next({message: 'Missing callback argument'});
    }
    else
    {
      return next ({message:'username already taken'});
    }
  })
});

var findAllUsers = require('./myApp.js').findAllUsers;
app.get('/api/exercise/users',function(req,res,next){
  findAllUsers(function(err, data){
    if(err) { return next(err) }
    res.type('txt').send(data);
  });
});

var createExercise = require('./myApp.js').createExercise;
var exerciseModel= require('./myApp.js').exerciseModel;
app.post('/api/exercise/add',function(req,res,next){
  
  if (!req.body.date)
    req.body.date= new Date();
  if (!req.body.userId)
    return next({message: 'unknown _id'});
    findUserById(req.body.userId, function(err,data1){
      //console.log(err);
      if (err) return next({message: 'unknown _id'})
      if (!data1) {
        return next({message: 'unknown _id'});
      }
      createExercise(req.body, function(err,data){
      if (err) { return next(err) }
      res.json({username: data1.username, description: data.description, duration: data.duration, _id: data1._id ,date: data.date.toDateString()});
      });
    
    });
});

app.get('/api/exercise/log', function(req,res,next){
  if (!req.query.userId)
    return next ({message: 'unknown userId'})
  var userId=req.query.userId, from=new Date(1970,1), to=new Date(2050,12), limit=100000000;
  if (req.query.from)
    from= req.query.from;
  if (req.query.to)
    to=req.query.to;
  if (req.query.limit)
    limit=req.query.limit;
  findUserById(userId , function(err,data1){
    if (err) return next({message: 'unknown userId'});
    exerciseModel.count({userId: userId , date: {$gte: from} , date: {$lte: to}}).limit(limit).exec(function(err,count){
      if (err) return next(err);
      exerciseModel.find({userId: userId , date: {$gte: from} , date: {$lte: to}}, {'_id':0}).limit(limit).select(['description','duration','date']).exec(function(err,data){
        if (err) return next(err);
        //data.date=data.date.toDateString();
        var x={};
        x._id= data1._id;
        x.username= data1.username;
        if (req.query.from)
          x.from=from;
        if (req.query.to)
          x.to=to;
        x.count=count;
        data.forEach(function(instance, index, array){
          array[index]=instance.toObject();
          //console.log(array[index]);
          array[index].date=array[index].date.toDateString()
        })
        x.log=data;
        
        res.json(x);
      });
    });
  });
});


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
