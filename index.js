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

let exerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: String
})

let User = mongoose.model('User', userSchema);
let Exercise = mongoose.model('Exercise', exerciseSchema);

const SaveAndSubmitUser = (username, done) => {
  let user = new User({
    username: username
  })


  user.save().then((data) => {console.log("username: " + username); done(null, data)}).catch((err)=>{console.log("save error: " + err); /* done(err, data) */});
  
}
const SaveAndSubmitExercise = (info, done) => {
  let exercise = new Exercise({
    //id: info.body.id,
    username: info.username,
    date: info.body.date,
    duration: info.body.duration,
    description: info.body.description
  })
  

  exercise.save().then((data)=>{console.log("exercise" + exercise); done(null, data)}).catch((err)=>{console.log("saveandsumbitexcercise err: " + err)})
}

const FindByUsername = (username, done) => {
  User.findOne({username: username}).then((data)=>{ console.log("data found: " + data); done(null, data)}).catch((err) => {console.log("error found: " + err)})
}

const FindAllByUsername = (username, done) => {
  Exercise.find({username: username}).then((data)=>{ console.log("data findAllByUsername: " + data); done(null, data)}).catch((err) => {console.log("error found: " + err)})
}

const FindById = (id, done) =>{
  User.findOne({_id: id}).then((data)=>{ console.log("data FindById: " + data); done(null, data)}).catch((err) => {console.log("error FindById: " + err)});
}

const FindAllUsers = (done) => {
  User.find().then((data) => {console.log("data found: " + data); done(null, data)}).catch((err)=>{console.log("error found: " + err)})
}



FindByIdAndUpdate = (info/* body *//* id */, done) => {
  console.log(info);
  //console.log(body._id.String());
  //console.log("info.description: " + info.body.description);
  //findOneAndUpdate returns data with inputs and saves changes to db
  User.findOneAndUpdate({username: info.username /* info.id *//* body[":_id"] *//* "66d1e8aefb1ffe4caf56ff55" *//* username: body.username */},{
    _id: info.id
    /* description: info.body.description, 
    duration: info.body.duration,
    date: info.body.date */
  }, {new: true}).then((data) => {console.log("data FindByIdAndUpdate: " + data); done(null, data)}).catch((err) => {console.log("error FindByIdAndUpdate: " + err)});
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
  console.log("req.body ");
  console.log(req.body);
  FindById(req.params._id, (err, data) => {
    if(err) console.log("FBI " + err);
    
    try{
      if(!req.body.date){
        console.log("hi null");
        req.body.date = new Date().toDateString();
      }else{
        req.body.date = new Date(req.body.date.replace(/-/g, '\/')).toDateString();
        if(req.body.date === "Invalid Date"){
          throw new Error("Invalid Date");
        }
      }
      SaveAndSubmitExercise({username: data.username, body: req.body}, (err, data) => {
        if(err) console.log("SSE " + err);
       
        res.json({
          _id: req.params._id,
          username: data.username,
          date: data.date,
          duration: data.duration,
          description: data.description,
        })       
      })

    }
    catch(err){
      console.log("post exercises catch err ");
      console.log(err);
      res.json({
        error: err.message
      })
    }
  })
})


app.get("/api/users/:_id/logs", (req, res) => {
  FindById(req.params._id, (err, data)=>{
    if(err) console.log("findbyid err " + err);
    FindAllByUsername(data.username, (err, info) =>{
      if(err) console.log("findbyusername err " + err);
      console.log("data " + info.length);
      console.log("query limit " + req.query.limit);
      console.log("request query ");
      console.log(req.query);
      let logArray = [];
      info.forEach(element => {
        let logObj = {
          description: element.description,
          duration: element.duration,
          date: element.date,
        }
        logArray.push(logObj);
      });

      if(req.query.from){
        logArray = logArray.filter((element) => {
          let date1 = new Date(element.date); let date2 = new Date(req.query.from);
          console.log(date1.getTime());  console.log(date2.getTime());
          return date1.getTime() >= date2.getTime();
        });
        console.log("req.query.from");
        console.log(logArray);
      }


      if(req.query.to){
        logArray = logArray.filter((element) => {
          let date1 = new Date(element.date); let date2 = new Date(req.query.to);
          console.log(date1.getTime());  console.log(date2.getTime());
          return date1.getTime() <= date2.getTime();
        });
      }
      

      //make new array after filtering or reducing with from and to 
      //for loop of limit push into final response array
      let finalLogArray = []
      if(!req.query.limit){
        req.query.limit = logArray.length;
      }
      for(let i = 0; i < req.query.limit; i++){
        finalLogArray.push(logArray[i]);
      }
      res.json({
        _id: req.params._id,
        username: data.username,
        count: info.length,
        log: finalLogArray
      })
    })
  })
})






const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
