
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');

var app = express();


var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');

var CommentSchema = new mongoose.Schema({
		author: String,
		time_elapsed: {type: Date, default: Date.now},
		message: String,
	    upvotes: Number
});
var Comment = mongoose.model('comments', CommentSchema);

var corsSettings = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'origin, content-type, accept');
	// deal with OPTIONS method during a preflight request
	if (req.method === 'OPTIONS') {
		res.send(200);
	} else {
		next();
	}
}

app.use(express.bodyParser());
app.use(corsSettings);

// all environments
app.set('port', process.env.PORT || 9090);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

function listComments(req, res){
	Comment.find({}, function (err, docs) {
		if (err) {
			console.log(err);
			res.send(500, err);
		} else {
			res.send(200, docs);
		}
	});
}

function createComment(req, res){
	Comment.create(req.body, function (err, doc) {
		if (err) {
			console.log(err);
			res.send(500, err);
		} else {
			res.send(200, doc);
		}
	});
}

function deleteComment(req, res){
	var id = req.params.id;
	Comment.findByIdAndRemove(id, function (err, doc) {
		if (err) {
			console.log(err);
			res.send(404, err);
		} else {
			res.send(200, doc);
		}
	});
}

function updateComment(req, res){
	var id = req.params.id;
	var newData = {
		upvotes: req.body.upvotes
	};
	Comment.findByIdAndUpdate(id, newData, function (err, doc) {
		if (err) {
			console.log(err);
			res.send(404, err);
		} else {
			res.send(200, doc);
		}
	});
}

app.get('/comments', listComments);
app.post('/comments', createComment);
app.put('/comments/:id', updateComment);
app.delete('/comments/:id', deleteComment);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
