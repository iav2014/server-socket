/**
 *
 * RedisConnector
 * A connector for redis. Implements
 * get and set methods for a given key
 *
 */

'use_strict';

var redisStore = require('redis'),
    logger = global.moonshine.logger('lib/connectors/redis.js');

function RedisConnector(config,callback) {
  this.init(config,callback);
}

RedisConnector.prototype = {
  resultHandler: function(callback) {
    return function(err, result) {
      if (err) callback(err);
      else callback(null, JSON.parse(result));
    }
  },

  init:function (config, callback) {
    this.conn = redisStore.createClient(config.port, config.host);
    this.conn.on("error", function (err) {
      if (err.message.indexOf('ECONNREFUSED') > 0) callback(err);
    });
    this.conn.on("connect", function(err) {
      callback(err, this.conn)
    });
  },

  findOne: function (params, callback) {
    this.conn.get(params.key,function(err, result){
      callback(err,JSON.parse(result));
  })
  },

  set: function (key, value, callback) {
    this.conn.set(key, value, function (err, result) {
      if (err) {
        logger.error('Redis error on set:' + err);
        callback(err);
      }
      else {
        callback(null, result);
      }
    });
  }
}

module.exports = RedisConnector;




