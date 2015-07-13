var log4js = require('log4js'),
  util = require('util'),
  moment = require('moment');


log4js.configure( {
  levels: {
  default: 'DEBUG'
  },
  appenders: [
    {
      category: '[all]',
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-ddThh:mm:ssO}|%[%p%]|%m'
      }
    }
  ],
    replaceConsole: false
});

var logger = log4js.getLogger();

/**
 * The exported API
 * @type {{logger: *}}
 * @return {Function}
 */

module.exports.logger = function (operationCode) {
  'use strict';
  var customLogger = {};
  ['debug', 'info', 'warn', 'error', 'fatal', 'express'].forEach(
    function (levelString) {
      customLogger[levelString] = function (message) {
        var requestId, bizProcessCorrelator, operation;
        if (process.domain) {
          requestId = process.domain.requestId;
          bizProcessCorrelator = process.domain.bizProcessCorrelator;
        }
        operation = operationCode ? operationCode : 'NA';
        requestId = requestId ? requestId : 'NA';
        bizProcessCorrelator = bizProcessCorrelator ? bizProcessCorrelator : 'NA';

        var formatedMessage = util.format('%s|%s|%s|%s|%s', bizProcessCorrelator,
          requestId, process.pid, operation, message);
        if (levelString === 'express') {
          return moment().format('YYYY-MM-DDThh:mm:ssZZ') + '|DEBUG|' + formatedMessage;
        }
        logger[levelString](formatedMessage);
      };
    });
  return customLogger;
};