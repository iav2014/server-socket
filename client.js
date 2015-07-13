var logger = require('./logger').logger(__filename);
var port = process.argv[2] || 8500,
	id = process.argv[3] || 8500,
	ip = process.argv[4] || 'localhost'
var io = require('socket.io-client')('http://localhost:' + port);

logger.debug(ip+':'+ port+' '+id);
io.on('error', function () {
	logger.error('Error connection');
});
io.on('done', function () {
	logger.info('done!');
});
io.on('connect', function () {
	logger.debug('[' + id + '] - Connected to:' + ip + ' port ' + port);
	io.emit('newMessage', {event: 0, data: 0});
});
io.on('connecting', function () {
	logger.debug('trying connected to ' + ip + ' port ' + port);
});
io.on('disconnect', function () {
	logger.debug('[' + id + '] disconnect from ' + ip + ' port ' + port);
	io.disconnect();
});
io.on('subscription confirm', function (msg) {
	switch (msg.data) {
		case 0:
			logger.debug('[' + id + '] (0) connection confirm from ' + ip + ' port ' + port);
			break;
		case 1:
			logger.debug('[' + id + '] (1) connection confirm from ' + ip + ' port ' + port);
			break;
		default:
			logger.debug('data not recognized');
			break;
	}
});
io.on('msgFromServer', function (msg) {
	switch (msg.data.code) {
		case 1:
			logger.debug('[' + id + '] message received from ' + ip + ' port ' + port + ' content ' + msg.data.data);
			break;
		default:
			logger.debug('data not recognized');
			break;
	}
});
process.on('message', msgFromMaster);
function msgFromMaster(m) {
}

