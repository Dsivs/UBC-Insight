/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";

import Log from "../Util";
import DataList from "./DataList";
import {isUndefined} from "util";
import {error} from "util";
let JSZip = require("jszip");

export default class InsightFacade implements IInsightFacade {

    private set:  Array<DataList>;

    constructor() {
        Log.trace('InsightFacadeImpl::init()');
        this.set = [];
    }


    /**
     * Add a dataset to UBCInsight.
     *
     * @param id  The id of the dataset being added.
     * @param content  The base64 content of the dataset. This content should be in the
     * form of a serialized zip file.
     *
     * The promise should return an InsightResponse for both fulfill and reject.
     *
     * Fulfill should be for 2XX codes and reject for everything else.
     *
     * After receiving the dataset, it should be processed into a data structure of
     * your design. The processed data structure should be persisted to disk; your
     * system should be able to load this persisted value into memory for answering
     * queries.
     *
     * Ultimately, a dataset must be added or loaded from disk before queries can
     * be successfully answered.
     *
     * Response codes:
     *
     * 201: the operation was successful and the id already existed (was added in
     * this session or was previously cached).
     * 204: the operation was successful and the id was new (not added in this
     * session or was previously cached).
     * 400: the operation failed. The body should contain {"error": "my text"}
     * to explain what went wrong.
     *
     */
    addDataset(id: string, content: string): Promise<InsightResponse> {
        const instance = this;
        //code will be used for fulfill only
        let code: number = 0;

        return new Promise(function (fulfill, reject) {

            if (!(instance.isBase64(content)))
                reject({code: 400, body: {"error": "Content Not Base64 Encoded"}});


            //step1: decode base64 content to readable json object
            let step1 = instance.decode(content).then(function (decoded) {

                console.log(decoded);


                for (var key in decoded)
                {
                    if (decoded.hasOwnProperty(key))
                    {
                        //console.log(key + " = " + decoded[key]);
                        let things = decoded[key];
                        for (var inner in things)
                        {
                            if (key.hasOwnProperty(inner))
                            {
                                //console.log(inner + "=" +things[inner]);
                            }
                        }
                    }
                }

            }).catch(function (err) {
                console.log(err);
            });

            //console.log(decoded)

            if (instance.isAdded(id))
            {
                code = 201;
                //remove then add again if already exits
                instance.removeDataset(id).catch(function(err) {
                    reject({code: 400, body: {"error": "Deletion error"}})
                });
            }
            else
            {
                code = 204;
            }

            /*var keys: any=[];
            var values: any=[];
            let i=0;


            for (var key in decoded[0]) {
                keys[i]= key;
                values[i]=content[0][key];
                i=i+1;
            }
            console.log(keys);
            console.log(values);*/


            Promise.all([step1]).then(function() {
                fulfill( {code: code, body: {}} );
            }).catch(function (err) {
                console.log(err);
            })
        });
    }


    /**
     * Remove a dataset from UBCInsight.
     *
     * @param id  The id of the dataset to remove.
     *
     * The promise should return an InsightResponse for both fulfill and reject.
     *
     * Fulfill should be for 2XX codes and reject for everything else.
     *
     * This will delete both disk and memory caches for the dataset for the id meaning
     * that subsequent queries for that id should fail unless a new addDataset happens first.
     *
     * Response codes:
     *
     * 204: the operation was successful.
     * 404: the operation was unsuccessful because the delete was for a resource that
     * was not previously added.
     *
     */
    removeDataset(id: string): Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {
            // TODO: implement
            fulfill(0);
        });
    }
    /**
     * Perform a query on UBCInsight.
     *
     * @param query  The query to be performed. This is the same as the body of the POST message.
     *
     * @return Promise <InsightResponse>
     *
     * The promise should return an InsightResponse for both fulfill and reject.
     *
     * Fulfill should be for 2XX codes and reject for everything else.
     *
     * Return codes:
     *
     * 200: the query was successfully answered. The result should be sent in JSON according in the response body.
     * 400: the query failed; body should contain {"error": "my text"} providing extra detail.
     * 424: the query failed because it depends on a resource that has not been PUT. The body should contain {"missing": ["id1", "id2"...]}.
     *
     */
    performQuery(query: QueryRequest): Promise <InsightResponse> {
        return new Promise(function (fulfill, reject) {
            // TODO: implement
            fulfill(0);
        });
    }

    /**
     * check if given string is encoded in base64.
     *
     * @param input  string needs to be checked
     *
     * @return boolean true if given string is in base64. false otherwise.
     */
    isBase64(input: string): boolean
    {
        if (isUndefined(input) || input === "")
            return false;
        //base64 should be multiple of 4 byte string
        if (input.length % 4 !== 0)
            return false;
        //base64 string ends with "="
        /*if (input.charAt(input.length - 1) !== "=")
            return false;*/

        return true;
    }
     /**
     * decodes base64 dataset to JSON object
     *
     * @param input  given string needs to be decoded
     * @return JSON object
     */
    decode(input: string): Promise<any>{
         let instance = this;

        return new Promise( function (fulfill, reject) {


            //we need to convert the data back to buffer
            var buffer = new Buffer(input, 'base64');

             instance.load(buffer)
                 .then(function (okay: any)
                 {
                     let content: string = "";
                     console.log("before");

                     for (var filename in okay.files) {
                         //inner promise is returned
                         var readfile: Promise<any> = okay.file(filename).async("string")
                             .then(function success(text: string) {

                                 //console.log(text);
                                 var buffer = new Buffer(text);
                                 text = buffer.toString();
                                 content = content + text;
                                 //console.log(content);
                                 //console.log('for loop');
                             });
                     }
                     //console.log("fulfill");
                     Promise.all([readfile]).then( function () {
                         fulfill(content);
                     });
                 }).catch(function (err) {
                 console.log(err);
                 reject(null);
                });

         //console.log('gdfgdf');
         //return pro;
        /*console.log("input = " +input);
        var b:string = new Buffer(input, 'base64').toString();
        return JSON.parse(b);*/
        //return null;
        });
    }

    /**
     * check if dataset has such id
     *
     * @param id given id that should be searched for
     * @return true if such id exits in dataset. false otherwise
     */
    isAdded(id: string): boolean
    {
        for (let i of this.set)
        {
            if (i.getID() === id)
            {
                return true;
            }
        }
        return false;
    }


    load(buffer: any): Promise<any>
    {
        return new Promise(function(fulfill, reject)
        {
            let zip = new JSZip();
            zip.loadAsync(buffer).then(function (okay: any) {
                fulfill(okay);
            }).catch(function (err: any) {
                reject(err);
            });
        });
    }
}
