var log4js = require('log4js'),
	util = require('util'),
	moment = require('moment'),
	stackTrace = require('stack-trace');

log4js.configure({
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

module.exports.logger = function (operationCode) {
	'use strict';
	var customLogger = {};
	['debug', 'info', 'warn', 'error', 'fatal', 'trace', 'express',].forEach(
		function (levelString) {
			customLogger[levelString] = function (message) {
				var frame, line, column, method;
				frame = stackTrace.get()[1];
				line = frame.getLineNumber();
				column = frame.getColumnNumber();
				method = frame.getFunctionName();
				method === null ? method = 'anonymous' : method = method;
				var operation;
				operation = operationCode ? operationCode : 'NA';
				var formatedMessage = util.format('%s|[%s(%s,%s)]|[%s]|%s',
					process.pid, method, line, column, operation, message);
				if (levelString === 'express') {
					return moment().format('YYYY-MM-DDThh:mm:ssZZ') + '|EXPRESS|' + formatedMessage;
				} else if (levelString === 'trace') {
					var formatedMessageTrace = util.format('\tat %s (%s:%s:%s)',
						method, operation, line, column);
					logger[levelString](formatedMessage);
					console.log(formatedMessageTrace);
				} else
					logger[levelString](formatedMessage);
			};
		});
	return customLogger;
};
