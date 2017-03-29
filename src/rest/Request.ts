import {InsightResponse} from "../controller/IInsightFacade";
import Log from "../Util";
import Server from "./Server";
import restify = require('restify');
import InsightFacade from "../controller/InsightFacade";
import {isUndefined} from "util";
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
            Request.handleReq(req).then( function(responding){
                //let result = Request.performEcho(req.params.msg);
                //Log.info('Server::echo(..) - responding ' + responding.code);
                res.json(responding.code, responding.body);
                fulfill();

            }).catch( function(err){
                //Log.error('Server::echo(..) - responding 400');
                res.json(err.code, err.body);
                reject();
            });
        });

        promise.then( function (res) {
            return next();
        }).catch( function (err) {
            return next();
        });
    }

    public static handleReq(req: restify.Request): Promise<any>
    {
        Log.trace('begin handleReg');
        let method = req.method;
        return new Promise( function(fulfill, reject) {

            switch (method) {
                case 'PUT':
                    //addData
                    let data = req.params.body;
                    console.log("HI");
                    console.log(data);
                    try {
                        data = data.toString("base64");
                        insight.addDataset(req.params.id, data)
                            .then(function (respond: any) {
                                Log.trace('PUT addDataSet THEN:');
                                fulfill(respond);
                            })
                            .catch(function (err: any) {
                                Log.trace('PUT addDataSet CATCH:');
                                reject(err);
                            });
                    } catch(err) {
                        reject({"code": 400, "body": {"error": "problem with buffer"}});
                    }
                    break;
                case 'GET':
                    //Retrieval and return a html file
                    //implementation left for D4
                    fulfill({code: 200, body: {}});
                    break;
                case 'POST':
                    //post
                    console.log("POST is called");
                    console.log("req.body = ");
                    console.log(req.body);
                    insight.performQuery(req.body).then(function (res: any) {
                        console.log("fulfill with res = " + res);
                        fulfill(res);
                    }).catch(function (err: any) {
                        console.log("request.ts reject");
                        console.log(err);
                        reject(err);
                    });
                    break;
                case 'DELETE':
                    //delete
                    insight.removeDataset(req.params.id).then(function (respond: any) {
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