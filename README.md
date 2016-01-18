# run-local-lambda
> An npm module to help you run and test Lambda functions locally

This module has been designed to be run by npm as part of a test script. It is a replacement for similar grunt/gulp Lambda plugins and is useful for developers wishing to use npm for everything.
While you can run and install it globally it is far better to include it with your Lambda solution. 

* This module allows you to run and test Lambda functions on your computer or in a continuous integration setting.
* You can pass in any event JSON object that you need.
* The context object is taken care off for you by the module.

## Getting Started
This module is designed to be run by npm to facilitate testing of Lambda functions. To install it run:

```shell
npm install run-local-lambda --save-dev
```

Your Lambda function should have a package.json which you can modify to add a test script like so:

```js
"scripts": {
    "test": "run-local-lambda --file index.js --event tests/event.json --timeout 3"
  }
```

Finally, you can invoke your test by simply doing the following:

```shell
npm run test
```

## Global Installation

You can also install this module globally and run it from the command line. To install it, execute the following:

```shell
npm install -g run-local-lambda
``` 

To run this module 
```shell
run-local-lambda --file lambda.js --event event.json
```

## Overview
### Parameters
This module accepts the following parameters which are all optional.

* --file [lambda file name] 	- Lambda function file name. Default: index.js
* --event [event file name] 	- Event data file name. Default: event.json
* --handler [handler name]  	- Lambda function handler. Default: handler
* --timeout [timeout seconds] 	- The timeout in seconds. Default: 3

### Context
The context object provides the following public methods as per the AWS implementation: 
* context.succeed(Object result) 
* context.fail(Error error)	
* context.done(Error error, Object result)
* context.getRemainingTimeInMillis()

Please note that the implementations of these methods are mere approximations to enable Lambda functions to execute correctly.
See [docs](http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html) for more information.  

### Event
The event data file can be provided using the --event parameter. These are JSON objects such as follows:

```js
{
  "Records":[
    {
      "eventVersion":"2.0",
      "eventSource":"aws:s3",
      "awsRegion":"us-east-1",
      "eventTime":"2016-12-11T00:00:00.000Z",
      "eventName":"ObjectCreated:Put",
      "userIdentity":{
        "principalId":"A3MCB9FEJCFJSY"
      },
      "requestParameters":{
        "sourceIPAddress":"127.0.0.1"
      },
      "responseElements":{
        "x-amz-request-id":"3966C864F562A6A0",
        "x-amz-id-2":"2radsa8X4nKpba7KbgVurmc7rwe/SDoYLFid6MZKn18Nocpe3Ofwo5TJ+uJCnkf/"
      },
      "s3":{
        "s3SchemaVersion":"1.0",
        "configurationId":"Video Upload",
        "bucket":{
          "name":"serverless-video-upload",
          "ownerIdentity":{
            "principalId":"A3MCB9FEJCFJSY"
          },
          "arn":"arn:aws:s3:::serverless-video-upload"
        },
        "object":{
          "key":"my video.mp4",
          "size":2236480,
          "eTag":"ddb7a52094d2079a27ac44f83ca669e9",
          "sequencer": "005686091F4FFF1565"
        }
      }
    }
  ]
}
```

## Contributing
There is no style guide so please try to follow the existing coding style. Please supply unit tests for any or modified functionality. Any and all PRs will be warmly welcomed. 

## Release History
### 1.0.0
Initial Release
