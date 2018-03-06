var express = require('express');
var router = express.Router();
var app = express();
var morgan = require('morgan');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var logger = require('./logger').logger(__filename);
var log4js = require('log4js');
var redis = require('./redis');
var theAppLog = log4js.getLogger();
var fork = require('child_process').fork;
var theHTTPLog = morgan(':remote-addr - :method :url HTTP/:http-version :status :res[content-length] - :response-time ms', {
	'stream': {
		write: function (str) {
			theAppLog.debug(str);
		}
	}
});
// configuration parameters
var mx = process.argv[0];
var _servers = (mx.indexOf('JXcore') > 0) ? process.argv[3] || 5 : process.argv[2] || 2;
var _initialServerPort = process.argv[3] || 8500;
var _restHost = '0.0.0.0';
var _restPort = 8080;
var _limit = 5000;
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json({limit: '5mb'}));
app.use(theHTTPLog);
app.use('/', router);
app.use(methodOverride());
var serverNodes = {io: []};
var clientsInCluster = [];
app.listen(_restPort, _restHost, function () {
	logger.info('REST Server started at [' + _restHost + ',' + _restPort + ']');
	redis.init(function (err) {
		if (err) {
			logger.error(err);
			process.exit(1);
		}
	});
	for (var i = 0; i < _servers; i++) {
		redisApply(i);
		var childServerPort = parseInt(_initialServerPort) + i;
		var nodeId = i;
		serverNodes.io[i] = fork('server.js', [childServerPort, nodeId]);
		serverNodes.io[i].on('message', msgFromChildServer);
		clientsInCluster.push({
			internetHost: _restHost,
			port: childServerPort,
			numPid: serverNodes.io[i].pid,
			numClients: 0,
			load: 0
		});
	}
	function redisApply(i) {
		redis.set(i, 0x20, function (err, result) {
			if (err) logger.error(err);
		});
	}
	function msgFromChildServer(msg) {
		var totalClients = 0;
		if (clientsInCluster !== null) {
			for (var i = 0; i < clientsInCluster.length; i++) {
				if (clientsInCluster[i].numPid == msg.numPid) {
					clientsInCluster[i].load = ((msg.numClients * 100) / _limit);
					clientsInCluster[i].numClients = msg.numClients;
					totalClients += clientsInCluster[i].numClients;
				}
			}
		}
	}
	router.get('/load', function (req, res) {
		logger.info('load REST called:');
		var forEach = require('async-foreach').forEach;
		var json = [];
		var j = 0;
		forEach(clientsInCluster, function (worker, index, arr) {
			var done = this.async();
			redis.get(index, function (err, replies) {
				if (replies != 0x20) json.push(JSON.parse(replies));
				done();
			});
		}, function (done, array) {
			logger.debug('load send workers');
			if (json.length === 0) {
				res.send('no active connections');
			} else res.send(json);
		});

	});
	router.get('/process', function (req, res) {
		logger.debug('process REST called:');
		res.send(clientsInCluster);

	});
	router.get('/send/:msg', function (req, res) {
		for (var i = 0; i < _servers; i++) {
			serverNodes.io[i].send({code: 1, data: req.params.msg});
		}
		res.send('msg sent:' + req.params.msg);
	});
	router.get('/sendto/:id/:msg', function (req, res) {
		for (var i = 0; i < _servers; i++) {
			serverNodes.io[i].send({code: 2, socketId: req.params.id, data: req.params.msg, pid: serverNodes.io[i].pid});
		}
		res.send('msg sent:' + req.params.msg);
	});
});





