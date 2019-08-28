var express = require('express')
var app = express()
var path = require('path')
const port = process.env.PORT

app.get("*/static/*", (req, res) => {
  console.log(`request path: ${req.path}. serving: ${path.resolve(__dirname, "build/static", req.params[1])}`)
  res.sendFile(path.resolve(__dirname, "build/static", req.params[1]))
})

app.get("*", (req, res) => {
  console.log(`route  ${req.path}`)
  res.sendFile(path.resolve(__dirname, "build/index.html"))
})

app.listen(port, (req, res) => {
  console.log(`listening on port ${port}`)
})
