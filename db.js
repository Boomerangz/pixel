var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://postgres@px.adbox.kz:5445/postgres';
var client


function get_client() {
 if (client == undefined) {
    client = new pg.Client(connectionString);
    client.connect();
 }
 return client
}


function execute_safe(query) {
 try {
   console.log(query)
   get_client().query(query,function (error, result) {
      if (error) {
          console.log(error)
      }
   })
 } catch (err) {
   console.log(err)
 }
}

module.exports.get_client = get_client;
module.exports.execute_safe = execute_safe;