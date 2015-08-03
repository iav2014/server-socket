var logger = require('./logger').logger(__filename);
var fork = require('child_process').fork;
var count = process.argv[2] || 4; // maxes out locally at ~82
var port = process.argv[3] || 8000;
var ip = process.argv[4] || 'localhost';
var nodes = {
	io: []
};
var ioPort = port;
var ackBroadcast = 0;
for (var i = 0; i < count; i++) {
	var nodeId = i + 1;
	nodes.io[i] = fork('client.js', [port, nodeId, ip]);
	logger.info("forceClient - fork client.js:" + 'io' + ' nodeId:' + nodeId + ' ip:' + ip + ' port:' + port +
		' pid:' + nodes.io[i].pid
	);
	nodes.io[i].on('message', msgFromChild);
}
function msgFromChild(m) {
	ackBroadcast += m.broadcast;
	logger.info("forceClient:" + "ack broadcast:" + ackBroadcast);
}



