// Config values
var mongo_ip = 'localhost';
var mongo_port = '27017';
var mongo_db = 'db_nosql';
var mongo_col = 'no_sql_collection';


// DB 
var MongoClient = require('mongodb').MongoClient;
var mongodb = require('mongodb');
var db;
MongoClient.connect("mongodb://"+mongo_ip+":"+mongo_port+"/"+mongo_db, function(err, database) {
	if(err) throw err;
	db = database;
});


/// Auxiliar functions
function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


function validateField(str){
	var json_str = '{ "str": '+str+' }';
	var validity_str = isJsonString(json_str);
	if (! validity_str){
		str = '"'+str+'"';
	}
	return str;
}


function checkUsername(str) {
    var pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,{}|\\":<>\?]/); //unacceptable chars
    if (pattern.test(str)) {
        return false;
    }
    return true; 
}


function checkPassword(str) {
    var pattern = new RegExp(/[~`!#%\^&*+=\-\[\]\\';,|<>\?]/); //unacceptable chars
    if (pattern.test(str)) {
        return false;
    }
    return true; 
}


/// Express
var express = require('express');
var app = express();
app.use(express.static(__dirname));
var ejs = require('ejs');
app.set('view engine', 'ejs');
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());


app.get('/', function(req, res) {
	res.sendFile('index.html', {});
});


app.post('/', function(req, res) {	
	// {"$ne": null} // {"$gt": ""}

	if(! checkUsername(req.body.user)){ res.render('error', {error: 'Injection detected in the username field' }); return; }
	if(! checkPassword(req.body.pass)){ res.render('error', {error: 'Injection detected in the password field' }); return; }
	
	var user = validateField(req.body.user);
	var pass = validateField(req.body.pass);
	var query = JSON.parse( '{ "user": '+user+', "pass": '+pass+' }' );
	db.collection(mongo_col).findOne(query, function (err, user) {
		if (err) {
			return res.status(500).send({message: err.message});
		}
		else if (!user) {
			res.render('error', {error: 'Sorry user not found!' });
		}
		else{
		    res.render('result', {user: user.user, pass: user.pass });
		}
	});
});


var server = app.listen(8000, function () {
	console.log('Visit port :%d', server.address().port);
});