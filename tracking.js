var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://postgres@46.101.9.112:5445/postgres';
var client = new pg.Client(connectionString);
client.connect();

var Cookies = require( "cookies" )
var parser = require('ua-parser-js');
var geoip = require('geoip-lite');
var js_template

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


function get_cookie(req, res) {
    if (req.method=='GET') {
      site_id=req.params.id
      local_id=get_random_string(20)
      res.end("advertCookieCallback_AdvertNetwork('{0}')".format(local_id))
      console.log('NEW LOCAL_ID',local_id)
      // async(function(){  log_local_id(site_id,local_id)   })
    }
}

function log_local_id(site_id,local_id) {	 
  query_str = "INSERT INTO localid_site_link (site_id, local_user_id) VALUES ((select site_id from rotator_userpixel where unique_code=\'{0}\' limit 1),\'{1}\')".format(page_id,local_id)
  console.log(query_str)
  query = client.query(query_str);
}


function get_iframe(req, res) {
	if (req.method=='GET') {
		cookies = new Cookies(req, res)

		page_id = req.params.id	    
		local_id=req.query.local_id
	 	session_id=req.query.session_id
	 	global_id=cookies.get("userID_AdvertNetwork")
	 	console.log("GLOBAL ID",global_id)
	 	if (global_id==undefined) {
	 		global_id=get_random_string(20)
	 		cookies.set("userID_AdvertNetwork", global_id)
	 		console.log("NEW GLOBAL ID",global_id)
	 	}
	 	res.end("")
 	
    async(function() {logPage(session_id,local_id,global_id, page_id)})
    async(function() {log_session_id(session_id,page_id, req)})
  }
}


function logPage(session_id, local_id, global_id, page_id) {
	console.log(session_id, local_id, global_id, page_id)
	query_str = "INSERT INTO localid_site_link (site_id, local_user_id, global_user_id) VALUES ((select site_id from rotator_userpixel where unique_code=\'{0}\' limit 1),\'{1}\',\'{2}\')".format(page_id,local_id,global_id)
  console.log(query_str)
  query = client.query(query_str);
}

function session_time(req, res) {
	session_id=req.query.session_id
	console.log(session_id)
	res.end("")

}

function get_start_js(req, res) {	
	session_id = get_random_string(20)
	page_id = req.params.id
	res.end(js_template.format(session_id, page_id))
	async(function(){log_session_id(session_id, page_id, req)})
}


module.exports.get_cookie = get_cookie;
module.exports.get_iframe = get_iframe;
module.exports.session_time = session_time;
module.exports.get_start_js = get_start_js;


function log_session_id(session_id,page_id, req) {
  ip_adr = req.connection.remoteAddress
  // agent = req.headers['user-agent']
  // id=req.params.id

  var ua = parser(req.headers['user-agent']);
  browser=ua['browser']['name']
  browser_version=ua['browser']['version']

  os=ua['os']['name']
  os_version=ua['os']['version']

  var geo = geoip.lookup(ip_adr);
  geo = JSON.stringify(geo)

  country = geo['country']
  city = geo['city']

  query_str = "INSERT INTO page_sessions_link (page_unique_code,session_id,os, os_version, browser, browser_version, country, city) VALUES (\'{0}\',\'{1}\',\'{2}\',\'{3}\',\'{4}\',\'{5}\',\'{6}\',\'{7}\')".format(page_id,session_id,os,os_version,browser,browser_version,country,city)
  console.log(query_str)
  query = client.query(query_str);   
}

function update_session_time(session_id, time) {
  query_str = "UPDATE page_sessions_link SET session_updated=now() WHERE session_id=\'{0}\'".format(session_id)
  console.log(query_str)
  query = client.query(query_str);   
}


var fs = require('fs');
fs.readFile('./start.js', function (err, data) {
  if (err) {
    throw err;
  }
  js_template = data.toString()
});