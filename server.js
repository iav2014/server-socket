var logger = require('./logger').logger(__filename);
var redis = require('./redis');
var port = process.argv[2] || 8001,
	idProcess = process.argv[3] || 8000;
var io = require('socket.io')(port);
var devices = [];
var ind, ld;
process.setMaxListeners(10000);
redis.init(function (err) {
	if (err) logger.error(err);
});

var redisAdapter = require('socket.io-redis');
io.adapter(redisAdapter({host: 'localhost', port: 6379}));

logger.debug('[' + idProcess + '] server at port ' + port);
io.sockets.on('connection', function (socket) {
	socket.on('newMessage', function (data) {
		switch (data.event) {
			case 0:
				var found = false;
				ld = devices.length;
				for (ind = 0; ind < ld; ind++) {
					if (socket === devices[ind].socket) {
						devices[ind].socket.emit('subscription confirm', {data: 0});
						found = true;
						break;
					}
				}
				if (!found) {
					socket.emit('subscription confirm', {data: 1});
					devices.push({socket: socket});
					var obj = JSON.stringify({numClients: devices.length, numPid: process.pid, port: port});
					redis.set(idProcess, obj, function (err, result) {
						if (err) logger.error(err);
						else {
							logger.debug('update to redis, key:' + idProcess + ' new value:' + obj);
							process.send({numClients: devices.length, numPid: process.pid, port: port});
						}
					})
				}
				break;
			default:
				logger.info('event not recognized');
				break;
		}
	});
	socket.on('disconnect', function () {
		logger.info('disconnect  socket received - socket:' + socket.id);
		deleteSocketDevice(socket);
		process.send({numClients: devices.length, numPid: process.pid, port: port});
	});
	socket.on('error', function () {
		logger.info('server error - socket:' + message.id);
		deleteSocketDevice(socket);
		process.send({numClients: devices.length, numPid: process.pid, port: port});
	});
	function deleteSocketDevice(id) {
		for (var i = 0; i < devices.length; i++) {
			if (devices[i].socket == id) {
				logger.info('socket deleted - socket:' + id.id);
				devices.splice(i, 1);
				redis.set(idProcess, JSON.stringify({
					numClients: devices.length,
					numPid: process.pid,
					port: port
				}), function (err, result) {
					if (err) logger.error(err);
					else {
						logger.debug('update to redis (decrement socket), key:' + idProcess);
					}
				});
				return (true);
			}
		}
		return false;
	}

	process.on('message', msgFromController);

	function msgFromController(m) {
		switch (m.code) {
			case 1:
				for (var i = 0; i < devices.length; i++) {
					if (socket === devices[i].socket) {
						devices[i].socket.emit('msgFromServer', {data: m});
					}
				}
				break;
		}
		process.send({numClients: devices.length, numPid: process.pid, port: port});
	}
});