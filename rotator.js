var db = require('./db.js');

hostname = "http://tr.euphorbia.co/"
media_link = "http://euphorbia.co/media/"
var banner_template

var link_map={}

function get_random_string(n) {
  var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < n; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

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


function async(func) {
  setTimeout(func,0)
}

function get_banner(req, res) {
 	res.writeHead(200, {'Content-Type': 'text/html'});
  	spot_id = req.params.id
  	console.log(spot_id)
	db.get_client().query(("SELECT pb.id, pb.image, pb.url FROM "+
                          "publishers_adspot AS pa "+
                          "INNER JOIN "+
                          "publishers_site_themes AS put "+
                          "ON pa.site_id=put.site_id "+
                          "INNER JOIN "+
                          "advertisers_campaign_themes AS pct "+
                          "ON pct.theme_id=put.theme_id "+
                          "INNER JOIN advertisers_banner AS pb "+
                          "ON pb.campaign_id=pct.campaign_id and pb.format_id = pa.format_id "+
                          "WHERE pa.code='{0}' "+
                          "ORDER BY RANDOM() LIMIT 1;").format(spot_id),
							function(err, result) {
	      if (!err) {
	      	if (result.rows.length>0) {
		      	row = result.rows[0]
		      	console.log(row.image)
	            rand_str=get_random_string(150)
	            link=hostname+"b/link/?l="+rand_str
	            image_link=media_link+row.image
		  	    console.log(row.id + ": " + row.url);
		  	    load_link=hostname+"b/loaded?i={0}&s={1}".format(row.id, spot_id)
		  	    res.end(banner_template.format(image_link,load_link,link))
	            async(
	                function () {
	                  link_map[rand_str]={'url':row.url,'banner_id':row.id, 'spot_id':spot_id}
	                }
	            )
            } else {
            	res.end("")
            }
           }
	  		 else {
	  			res.end(err.text)
	  			console.log(err)
	  		}
  		});
}

function redirect_link(req, res) {
  console.log(redirect_link)
  var user_id
    if (req.cookies.euph_id) {
      user_id = req.cookies.euph_id
    } else {
      user_id = get_random_string(30)
      res.cookie('euph_id', user_id, { maxAge: 900000, httpOnly: true });
    } 
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
    setTimeout(function() {delete link_map[l_id];},3600*1000)
    async(function() {
                query = 'INSERT INTO banner_clicks (banner_id,spot_code,user_id) VALUES ({0},\'{1}\',\'{2}\')'.format(banner_id,spot_id,user_id)
                db.execute_safe(query)
              })
  } else {
  	console.log(link_record)
  	console.log(l_id)
  	console.log(link_map)
  	res.end();
  }
}

function banner_loaded(req, res) {
    var user_id
    if (req.cookies.euph_id) {
      user_id = req.cookies.euph_id
    } else {
      user_id = get_random_string(30)
      res.cookie('euph_id', user_id, { maxAge: 900000, httpOnly: true });
    } 
    res.end("");
    banner_id = req.query.i
    console.log("banner {0} loaded".format(banner_id))
    async ( function() {
        var now = new Date();
        banner_id = req.query.i
        spot_id = req.query.s
        query = 'INSERT INTO banner_show_stats (banner_id,spot_code, user_id) VALUES ({0},\'{1}\',\'{2}\')'.format(banner_id,spot_id,user_id)
        db.execute_safe(query);
        console.log("banner {0} writed to log".format(banner_id))
      });
}


var path = require('path');
path_to_template=path.join(__dirname, 'templates/banner.html')
var fs = require('fs');
fs.readFile(path_to_template, function (err, data) {
  if (err) {
    throw err;
  }
  banner_template = data.toString()
});


module.exports.get_banner = get_banner;
module.exports.banner_loaded = banner_loaded;
module.exports.redirect_link = redirect_link;
