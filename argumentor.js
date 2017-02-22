const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const port    = 1337;

let app = express();
let db  = new sqlite3.Database('./db/argumentor.db');

process.on(['SIGINT','SIGKILL'], function() {
    db.close();
    console.log('Connection is closed');
});

db.serialize(
  function() {
  
    console.log("Creating basic tables...");
    db.run("CREATE table IF NOT EXISTS arguments (id INTEGER PRIMARY KEY AUTOINCREMENT, argument TEXT, description TEXT);");
    db.run("CREATE table IF NOT EXISTS tags (id INTEGER PRIMARY KEY AUTOINCREMENT, tag TEXT);");
    db.run("CREATE table IF NOT EXISTS arguments_arguments (id INTEGER PRIMARY KEY AUTOINCREMENT, argument_id INTEGER, response_id INTEGER);");
    db.run("CREATE table IF NOT EXISTS arguments_tags (id INTEGER PRIMARY KEY AUTOINCREMENT, argument_id INTEGER, tag_id INTEGER);");
    console.log("...done.");
    
  }
);

function get_arguments( word, callback ) {
  
  if (word === null) {
    callback([]);
    return;
  }
  
  let qstring =  
    "SELECT \
      * \
    from \
      arguments A \
      inner join arguments_tags AT \
        on A.id = AT.argument_id \
      inner join tags T \
        on T.id = AT.tag_id \
    where \
      T.tag like ?  \
      or A.argument like ? \
    ;";
    
  db.all(
    qstring,
    "%" + word + "%",
    "%" + word + "%",
    function(err, rows) {
      if (typeof rows != "undefined") {
        callback( rows );
      }
    }
  );
}


app.get('/arguments/:word', function(req, res) {
  let cb = function ( arr ) {
    res.send( JSON.stringify(arr, null, " ") );
  };
  
  let word = req.params && req.params.word ? req.params.word : null;
  
  get_arguments(req.params.word, cb);
  
});
app.listen( port );
console.log('Listening on port ' + port + '...');

