/**
 * Created by petersbarski on 30/12/2015.
 */
'use strict';

exports.handler = function(event, context){
    console.log(event);

    context.succeed('It worked!');
};