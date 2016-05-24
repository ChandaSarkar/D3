var express = require('express');
var app = express();
var path = require('path');

// viewed at http://localhost:8080
app.get('/index_Tree', function(req, res) {
    console.log(__dirname);
    res.sendFile(path.join(__dirname + '/index_Tree.html'));
    //res.send('yo');
});

app.get('/effects.css', function(req, res) {
    res.sendFile(path.join(__dirname + '/effects.css'));
});

app.get('/effects.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/effects.js'));
});

app.get('/Monitors.json', function(req, res) {
    res.sendFile(path.join(__dirname + '/Monitors.json'));
});

app.listen(8080);
