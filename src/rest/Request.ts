import {InsightResponse} from "../controller/IInsightFacade";
import Log from "../Util";
import Server from "./Server";
import restify = require('restify');
import InsightFacade from "../controller/InsightFacade";
let insight = new InsightFacade();

/**
 * Created by John on 2017-02-28.
 */


export default class Request
{

    // The next two methods handle the echo service.
    // These are almost certainly not the best place to put these, but are here for your reference.
    // By updating the Server.echo function pointer above, these methods can be easily moved.

    public static echo(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('Server::echo(..) - params: ' + JSON.stringify(req.params));

        let promise = new Promise( function (fulfill, reject){
            try {
                Request.handleReq(req).then( function(responding){
                    //let result = Request.performEcho(req.params.msg);
                    Log.info('Server::echo(..) - responding ' + responding.code);
                    res.json(responding.code, responding.body);
                    fulfill();

                }).catch( function(err){
                    Log.error('Server::echo(..) - responding 400');
                    res.json(err.code, err.body);
                    reject();
                });
            } catch (err) {
                Log.error('Server::echo(..) - responding 400');
                res.json(400, {error: err.message});
                reject();
            }
        });

        Promise.all([promise]).then( function (res) {
            return next();
        }).catch( function (err) {
            return next();
        })
    }

    public static performEcho(msg: string): InsightResponse {
        if (typeof msg !== 'undefined' && msg !== null) {
            return {code: 200, body: {message: msg + '...' + msg}};
        } else {
            return {code: 400, body: {error: 'Message not provided'}};
        }
    }

    public static handleReq(req: restify.Request): Promise<any>
    {
        let method = req.method;
        let id:string;
        let body = JSON.parse(JSON.stringify(req.params));

        for (let value in body)
        {
            if (value == 'id' && body.hasOwnProperty(value)) {
                id = body[value];
                //debug
                while (id !== null && id.indexOf(':') >= 0)
                {
                    id = id.substr(id.indexOf(':')+1, id.length);
                }
            }
            //if auto test failed for add Dataset via client, this is the bug:
            //client type mismatch, current assumed client type is JsonClient
            else if (body.hasOwnProperty(value))
            {
                body = body[value];
                break;
            }
        }
        return new Promise( function(fulfill, reject) {

            switch (method) {
                case 'PUT':
                    //addData
                    insight.addDataset(id, body).then(function (respond: any) {
                        fulfill(respond);
                    }).catch(function (err: any) {
                        reject(err);
                    });
                    break;
                case 'GET':
                    //Retrieval and return a html file
                    //implementation left for D4
                    fulfill({code: 200, body: {}});
                    break;
                case 'POST':
                    //post
                    insight.performQuery(JSON.parse(body)).then(function (res: any) {
                        fulfill(res);
                    }).catch(function (err: any) {
                        reject(err);
                    });
                    break;
                case 'DELETE':
                    //delete
                    insight.removeDataset(id).then(function (respond: any) {
                        fulfill(respond);
                    }).catch(function (err: any) {
                        reject(err);
                    });
                    break;
                default:
                    //unknown request
                    reject(null);
            }
        });
    }
}