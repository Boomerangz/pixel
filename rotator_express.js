var parser = require('ua-parser-js');
var geoip = require('geoip-lite');

var express = require('express')
var app = express()
var pg = require('pg');

var tracking = require('./tracking.js');
var rotator = require('./rotator.js');


app.get('/t/get_id/:id([A-Z0-9]+):extension(.js)', tracking.get_cookie)
app.get('/t/ifr/:id([A-Z0-9]+):extension(.html)', tracking.get_iframe)
app.get('/t/get_js/:id([A-Z0-9]+):extension(.js)', tracking.get_start_js)
app.get('/t/session/', tracking.session_time)

app.get('/b/get/:id([A-Z0-9]+)', rotator.get_banner)
app.get('/b/link', rotator.redirect_link)
app.get('/b/loaded', rotator.banner_loaded)

function startServer() {
  var server = app.listen(8080)  
}

var path = require('path');
template_path=path.join(__dirname, 'template.html')

startServer()

