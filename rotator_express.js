String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');  
        if (arguments[i]==undefined) {
          arguments[i] = "NULL"
        }      
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

const GifCode = new Buffer([
    0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 
    0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x2c, 
    0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 
    0x02, 0x44, 0x01, 0x00, 0x3b]);

var parser = require('ua-parser-js');
var geoip = require('geoip-lite');
var hostname='http://localhost:1237/'
var express = require('express')
var app = express()
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://postgres@46.101.9.112:5445/postgres';
var client = new pg.Client(connectionString);
client.connect();



var banner_template

var link_map={}

function get_random_string(n) {
  var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < n; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function async(func) {
  setTimeout(func,0)
}

function get_banner(req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'});
  spot_id = req.query.s
	db.get("SELECT id, banner_url FROM rotator_banner ORDER BY RANDOM() LIMIT 1;", function(err, row) {
	      if (!err) {
            rand_str=get_random_string(7)
            link=hostname+"link/?l="+rand_str
	  	    	console.log(row.id + ": " + row.banner_url);
	  	    	res.end(banner_template.format(row.banner_url,row.id,link))           
            async(
                function () {
                  link_map[rand_str]={'url':row.banner_url,'banner_id':row.id, 'spot_id':spot_id}
                }
            )             
	  		} else {
	  			res.end(err.text)
	  			console.log(err)
	  		}
  		});
}

function redirect_link(req, res) {
  l_id = req.query.l
  link_record=link_map[l_id]
  link = link_record['url']
  banner_id = link_record['banner_id']
  spot_id = link_record['spot_id']
  if (link!=undefined) {
    console.log(link,l_id)
    res.writeHead(302, 
              {
                'Location': link
              });
    res.end();
    async(function() {
                delete link_map[l_id];                
                var now = new Date();
                query = 'INSERT INTO banner_clicks (time,banner_id,spot_id) VALUES ("{0}",{1},{2})'.format(now,banner_id,spot_id)
                console.log(query)
                db.run(query)
              })
  }  
}

function banner_loaded(req, res) {
    res.end("");
    banner_id = req.query.i
    console.log("banner {0} loaded".format(banner_id))
    async ( function() {
        var now = new Date();
        ip = req.connection.remoteAddress
        banner_id = req.query.i
        db.run("INSERT INTO banner_show_stats (ip,banner_id,time) VALUES ('{0}',{1},'{2}')".format(ip,banner_id,now));        
        console.log("banner {0} writed to log".format(banner_id))
      });        
  }

function pixel(req, res) {
    if (req.params.extension == ".gif"){
      res.send(GifCode, { 'Content-Type': 'image/gif' }, 200);
      res.end()
    } else
      res.end(" ")
    if (req.method=='GET') {
      async(function() {logPixel(req)})
    }
}

function logPixel(req) {
  ip_adr = req.connection.remoteAddress
  agent = req.headers['user-agent']
  id=req.params.id

  var ua = parser(req.headers['user-agent']);
  browser=ua['browser']['name']
  browser_version=ua['browser']['version']

  os=ua['os']['name']
  os_version=ua['os']['version']

  var geo = geoip.lookup(ip_adr);
  geo = JSON.stringify(geo)


  query_str = 'INSERT INTO pixel_loads (ip, useragent, pixel_id, os, os_version, browser, browser_version, geo) VALUES (\'{0}\',\'{1}\',\'{2}\',\'{3}\',\'{4}\',\'{5}\',\'{6}\',\'{7}\')'.format(ip_adr,agent, id,os, os_version, browser, browser_version, geo)
  console.log(query_str)
  query = client.query(query_str);
}

// respond with "hello world" when a GET request is made to the homepage
// app.get('/', get_banner)
// app.get('/loaded/', banner_loaded)
// app.get('/link/', redirect_link)
app.get('/p/:id([A-Z0-9]+):extension(.gif|.js)', pixel)

function startServer() {
  var server = app.listen(1237)  
}

var fs = require('fs');
fs.readFile('./template.html', function (err, data) {
  if (err) {
    throw err;
  }
  banner_template = data.toString()
  startServer()
});

