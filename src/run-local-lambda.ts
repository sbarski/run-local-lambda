/*
 * The MIT License (MIT)
 * Copyright (c) 2016 Peter Sbarski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

import * as path from 'path';
import { Context } from 'aws-lambda';

export interface Settings {
    file: string;
    event?: string;
    timeout: number;
    handler: string;
}

let settings: Settings = {
    file : 'index.js',
    event : null,
    timeout : 3000,
    handler : 'handler'
};

(function() {

    /*
     * Q: Why not use commander to parse command line arguments? A. To reduce dependencies.
     *
     * Command Line Arguments:
     * --file, -f <filename:string>         #Name of the file containing the Lambda function (Default: index.js)
     * --event, -e <event:string>           #Name of the file containing the event object (Default: event.json)
     * --timeout, -t <timeout:int>          #The timeout in seconds (Default: 3 seconds)
     * --handler, -h <handler:string>       #Name of the handler function to invoke (Default: handler.exports)
     *
     * E.g. node run-local-lambda (providing index.js and event.json are in the current directory)
     * E.g. node run-local-lambda --file index.js --event event.json --timeout 3 --memory 128 --handler handler
     */
    function processArguments(): void {
			process.argv.forEach(function(argument, index, array) {
            switch (argument) {
                case '--file':
                    settings.file = array[index + 1];
				break;

                case '--event':
                    settings.event = array[index + 1];
				break;

                case '--timeout':
                    settings.timeout = parseInt(array[index + 1], 10) * 1000; // convert seconds to milliseconds
				break;

                case '--handler':
                    settings.handler = array[index + 1];
                break;

                default:
                    break;
            }
        });
    }

	function createContext(functionName: string, timeout: number): Context {
		let startTime = new Date();

        let succeed = function(result){
            if (result !== undefined) {
                console.log(JSON.stringify(result));
            }

            process.exit();
        };

        let fail = function(error){
            if (error !== undefined) {
                console.log(error);
            }

            process.exit(1);
        };

        let done = function(error, result){
            if (error === null) {
                succeed(result);
            } else {
                fail(error);
            }
        };

        let getRemainingTimeInMillis = function() { // Returns the approximate remaining execution time (before timeout occurs)
			let currentTime = new Date();
			return settings.timeout - (currentTime.getMilliseconds() - startTime.getMilliseconds());
        };

        let hash: string = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        let context: Context = {
            awsRequestId : [ hash.substr(0, 8), hash.substr(9, 4), hash.substr(12, 4), hash.substr(16, 4), hash.substr(20, 12) ].join('-'),
            logGroupName : '/aws/lambda/' + functionName,
            logStreamName : (new Date()).toISOString().substr(0, 10).replace(/-/g, '/') + '/[$LATEST]' + hash,
            functionName: functionName,
            functionVersion: '1.0',
            invokedFunctionArn: 'arn:aws:lambda:aws-region:1234567890123:function:' + functionName,
            memoryLimitInMB : 128,
            getRemainingTimeInMillis: getRemainingTimeInMillis,
            callbackWaitsForEmptyEventLoop: true,
            succeed: succeed,
            fail: fail,
            done: done
        };

        return context;
	}

    function callback(error: string | Error, result: any): void {
        if (error === undefined || error === null) {
            if (result !== undefined && result !== null) {
                console.log(JSON.stringify(result));
            }
        } else {
            if (error instanceof Error) {
                console.log({
                    'errorMessage' : error.message,
                    'errorType' : error.name,
                    'stack' : error.stack
                });
            } else {
                console.log('errorMessage: ' + error);
            }
        }

        process.exit();
    }

    processArguments();

    let event: any = settings.event != null ? require(path.resolve(settings.event, '.')) : null;
    let context: Context = createContext('func', settings.timeout);
    let lambda: any = require(path.resolve(settings.file, '.'));

    function execute(): void {
		setTimeout(function(){
			console.log('The function timed out after ' + settings.timeout + ' seconds');
			process.exit();
		}, settings.timeout);

		lambda[settings.handler](event, context, callback)
	};

    execute();
})();
