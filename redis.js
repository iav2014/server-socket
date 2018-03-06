var logger = require('./logger').logger(__filename);
var redisStore = require('redis');
var AsbtractRedisClient = {
	init: function (callback) {
		this.conn = redisStore.createClient();
		this.conn.on("error", function (err) {
			logger.error(err);
			callback(err);
		});
		this.conn.on("connect", function (err) {
			if (err) {
				logger.error(err);
				callback(err);
			}
			else {
				logger.info('connected to redis');
				callback(null);
			}
		});
	}
};
AsbtractRedisClient.get = function (key, callback) {
	this.conn.get(key, function (err, reply) {
		if (err) {
			callback(err);
		}
		else {
			callback(null, reply);
		}
	});
};
AsbtractRedisClient.set = function (key, value, callback) {
	this.conn.set(key, value, function (err, reply) {
		if (err) {
			callback(err);
		}
		else {
			callback(null, reply);
		}
	});
};
module.exports = AsbtractRedisClient;



