const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const db = require('./database');

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', (req, res) => {
  db.FindAllUsers((err, data)=>{
    if(err) console.log(err);
    res.json(data);
  })
})

app.post('/api/users', (req, res) => {
  console.log(req.body);
  db.SaveAndSubmitUser(req.body.username, (err, data) => {
    if(err) console.log(err);

    db.FindByUsername(req.body.username, (err, datafound)=>{
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
  db.FindById(req.params._id, (err, data) => {
    if(err) console.log("FBI " + err);
    
    try{
      if(!req.body.date){
        req.body.date = new Date().toDateString();
      }else{
        req.body.date = new Date(req.body.date.replace(/-/g, '\/')).toDateString();
        if(req.body.date === "Invalid Date"){
          throw new Error("Invalid Date");
        }
      }
      db.SaveAndSubmitExercise({username: data.username, body: req.body}, (err, data) => {
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
  db.FindById(req.params._id, (err, data)=>{
    if(err) console.log("findbyid err " + err);
    db.FindAllByUsername(data.username, (err, info) =>{
      if(err) console.log("findbyusername err " + err);
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
          return date1.getTime() >= date2.getTime();
        });
      }


      if(req.query.to){
        logArray = logArray.filter((element) => {
          let date1 = new Date(element.date); let date2 = new Date(req.query.to);
          return date1.getTime() <= date2.getTime();
        });
      }
      
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
