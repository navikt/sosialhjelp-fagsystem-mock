var express = require('express')
var app = express()
var path = require('path')
const port = 80

app.get("/sosialhjelp/fagsystem-mock/isAlive", (req, res) => {
    console.log(`request isAlive`)
    res.status(200).send('This was a triumph')
})

app.get("*/static/*", (req, res) => {
    console.log(`request path: ${req.path}. serving: ${path.resolve(__dirname, "build/static", req.params[1])}`)
    res.sendFile(path.resolve(__dirname, "build/static", req.params[1]))
})

app.get("*/sosialhjelp/fagsystem-mock/img/*", (req, res) => {
    console.warn("------------");
    console.warn("dirname: " + __dirname);
    console.warn("req.params[1]: " + req.params[1]);
    var fullpath = path.resolve(__dirname, "build/sosialhjelp/fagsystem-mock/img", req.params[1]);
    console.warn("fullpath: " + fullpath);
    res.sendFile(fullpath)
})

app.get("*", (req, res) => {
    console.log(`route  ${req.path}`)
    res.sendFile(path.resolve(__dirname, "build/index.html"))
})

app.listen(port, (req, res) => {
    console.log(`listening on port ${port}`)
})
