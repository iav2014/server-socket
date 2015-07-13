//
// sender outside the main socket.io process
// the module reads from redis all configuration and info server
// to use for sending example message to all clients
//

var logger = require('./logger').logger(__filename);
var io = require('socket.io-emitter')('localhost');
var _timeLapse = 5000;
logger.debug('outsideSender ready to send any data example using redis apply')
setInterval(function(){
	var json = {data:{code: 1, data: 'msg from outsider'} }
	io.emit('msgFromServer',json);
	logger.debug('msg sent to all:'+JSON.stringify(json));
}, _timeLapse);