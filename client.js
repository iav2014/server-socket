var logger = require('./logger').logger(__filename);
var port = process.argv[2] || 8500,
	num = process.argv[3] || 1,
	split = process.argv[4] || 1,
	ip = process.argv[5] || 'localhost';

logger.debug(port, num, split, ip);
port = parseInt(port, 10);
num = parseInt(num, 10);
split = parseInt(split, 10);
var seq = 0;
for (var p = port; p < port + split; p++) {
	for (var c = 0; c < num; c++) {
		logger.debug('port:' + p, ' sockets:' + c, ' sequential:' + seq);
		seq++;
		start({ip: ip, port: p, seq: seq,id:seq});
	}
}


function start(data) {
	var io = require('socket.io-client')('http://' + data.ip + ':' + data.port, {'forceNew': true});
	logger.debug(data.ip + ':' + data.port + ' ' + data.id);
	io.on('error', function () {
		logger.error('Error connection');
	});
	io.on('done', function () {
		logger.info('done!');
	});
	io.on('connect', function () {
		logger.debug('[' + data.id + '] - Connected to:' + data.ip + ' port ' + data.port);
		io.emit('newMessage', {event: 0, data: 0});
	});
	io.on('connecting', function () {
		logger.debug('trying connected to ' + data.ip + ' port ' + data.port);
	});
	io.on('disconnect', function () {
		logger.debug('[' + data.id + '] disconnect from ' + data.ip + ' port ' + data.port);
		io.disconnect();
	});
	io.on('subscription confirm', function (msg) {
		logger.debug(msg);
		switch (msg.data) {
			case 0:
				logger.debug('[' + msg.socket + '] - [' + data.id + ']  connection confirm from ' + data.ip + ' port ' + data.port);
				break;
			case 1:
				logger.debug('[' + msg.socket + '] - [' + data.id + ']  connection confirm from ' + data.ip + ' port ' + data.port);
				break;
			default:
				logger.debug('data not recognized');
				break;
		}
	});
	io.on('msgFromServer', function (msg) {
		switch (msg.data.code) {
			case 1:
				logger.debug('[' + data.id + '][' + msg.data.socketId + '] [broadcast] message received from ' + data.ip + ' port ' + data.port + ' content ' + msg.data.data);
				break;
			case 2:
				logger.debug('[' + data.id + '][' + msg.data.socketId + '] message received from ' + data.ip + ' port ' + data.port + ' content ' + msg.data.data);
				break;
			default:
				logger.debug('data not recognized');
				break;
		}
	});
	process.on('message', msgFromMaster);
	function msgFromMaster(m) {
	}
}

