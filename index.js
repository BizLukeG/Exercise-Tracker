const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))

mongoose.connect(process.env.MONGO_URI, {useUnifiedTopology: true}).then((console.log("mongodb is connected"))).catch(error => (console.log(error)));

let userSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: String
})

let User = mongoose.model('User', userSchema);

const SaveAndSubmitUser = (username, done) => {
  let user = new User({
    username: username
  })


  user.save().then((data) => {console.log("username: " + username); done(null, data)}).catch((err)=>{console.log("save error: " + err); /* done(err, data) */});
  
}

const FindByUsername = (username, done) => {
  User.findOne({username: username}).then((data)=>{ console.log("data found: " + data); done(null, data)}).catch((err) => {console.log("error found: " + err)})
}

const FindAllUsers = (done) => {
  User.find().then((data) => {console.log("data found: " + data); done(null, data)}).catch((err)=>{console.log("error found: " + err)})
}

FindByIdAndUpdate = (info/* body *//* id */, done) => {
  //console.log(body._id.String());
  console.log("info.description: " + info.body.description);
  //findOneAndUpdate returns data with inputs and saves changes to db
  User.findOneAndUpdate({_id: info.id/* body[":_id"] *//* "66d1e8aefb1ffe4caf56ff55" *//* username: body.username */},{
    description: /* body */info.body.description, 
    duration: info.body.duration,
    date: info.body.date
  }, {new: true}).then((data) => {console.log("data found: " + data); done(null, data)}).catch((err) => {console.log("error found: " + err)});
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', (req, res) => {
  FindAllUsers((err, data)=>{
    if(err) console.log(err);
    res.json(data);
  })
})

app.post('/api/users', (req, res) => {
  console.log(req.body);
  SaveAndSubmitUser(req.body.username, (err, data) => {
    if(err) console.log(err);

    //find _id with username
    FindByUsername(req.body.username, (err, datafound)=>{
      if(err) console.log(err);
      let user_id = datafound._id;

      res.json({
        username: data.username,
        _id: user_id
      })
    }) 
  })
})

app.post('/api/users/:_id/exercises', (req, res) => {
  console.log("req.params._id: "); console.log(req.params._id);
  console.log("req.body.date: "); console.log(req.body.date);
  console.log("req.body: "); console.log(req.body);
  console.log("req.body[':_id']:"); console.log(req.body[":_id"]);
  //console.log("hasDate: " + Object.keys(req.body).includes('date'));
  console.log(new Date(req.body.date));
  if(!req.body.date){
    console.log("hi null");
    req.body.date = new Date().toDateString();
  }else{
    req.body.date = new Date(req.body.date.replace(/-/g, '\/')).toDateString();
  }
   
  //might not work because it might just be updateing one over and over instead of making multiple different exercises to count
  //need to make an exercise collection to save to after getting all info for an exercise and add user detail to it
  FindByIdAndUpdate({id: req.params._id, body: req.body}, (err, data)=>{
    if(err) console.log(err);
    console.log("end data: "); console.log(data);
    res.send({
      _id: data._id,
      username: data.username,
      date: data.date,
      duration: data.duration,
      description: data.description,
    })
  });
})

app.get("/api/users/:_id/logs", (req, res) => {
  res.send({});
})



 /*  const SaveAndSubmitUserExercise = (body, done) => {
    let user = new User({
      duration: body.duration,
    })
    
    done(null, user);

  }

  app.post('/api/users/:_id/exercises', (req, res) =>{
    SaveAndSubmitUserExercise(req.body, (err, data) => {
      if(err) console.log(err);
      res.json(data);
    })
  }) */



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
