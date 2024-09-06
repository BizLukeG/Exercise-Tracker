require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {useUnifiedTopology: true}).then((console.log("mongodb is connected"))).catch(error => (console.log(error)));

let userSchema = new mongoose.Schema({
  username: String,
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



const FindByIdAndUpdate = (info, done) => {
  console.log(info);
  User.findOneAndUpdate({username: info.username},{
    _id: info.id
  }, {new: true}).then((data) => {console.log("data FindByIdAndUpdate: " + data); done(null, data)}).catch((err) => {console.log("error FindByIdAndUpdate: " + err)});
}

module.exports = {
  User, Exercise, SaveAndSubmitUser, SaveAndSubmitExercise, FindByUsername, FindAllByUsername, FindById, FindAllUsers, FindByIdAndUpdate
}