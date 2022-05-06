const express = require('express')
const routes = require("./routes/index")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const constants = require('./constants')


const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(routes) ;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  mongoose.connect(constants.mongodbURL).then(connect => {
      console.log("Conneted to DB!")
  }, error => {
      console.log("Error connecting to db: " + error.toString())
  })
})