/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";

import Log from "../Util";
import DataList from "./DataList";
import {isUndefined} from "util";
let JSZip = require("jszip");
let fs = require("fs");
let localData = "./cache/";

export default class InsightFacade implements IInsightFacade {

    private set:  Array<DataList>;
    private id:string;

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
        this.id = id;
        //code will be used for fulfill only
        let code: number = 0;

        return new Promise(function (fulfill, reject) {

            if (!(instance.isBase64(content)))
                reject({code: 400, body: {"error": "Content Not Base64 Encoded"}});


            let removal: Promise<any>;
            //check if data set has been added
            if (instance.isExist(id))
            {
                //if so, delete and write again
                code = 201;
                //remove then add again if already exits
                 removal = instance.removeDataset(id).catch(function(err) {
                    reject({code: 400, body: {"error": "Deletion error"}})
                });
            }
            else
            {
                code = 204;
            }

            //step1: decode base64 content to readable json object
            let caching = instance.decode(content).then(function (decoded) {

                //console.log(decoded);

                /*var obj = JSON.parse(decoded);

                for (var key in obj)
                {
                    if (obj.hasOwnProperty(key))
                    {
                        console.log(key + " = " + obj[key]);
                        let things = obj[key];
                        for (var inner in things)
                        {
                            if (key.hasOwnProperty(inner))
                            {
                                console.log(inner + "=" +things[inner]);
                            }
                        }
                    }
                }*/

            }).catch(function (err) {
                console.log(err);
            });

            //console.log(decoded)


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


            Promise.all([removal, caching]).then(function() {
                fulfill( {code: code, body: {}} );
            }).catch(function (err) {
                console.log(err);
                reject(err);
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
        let instance = this;
        return new Promise(function (fulfill, reject) {
            if (!instance.isExist(id))
                reject({code: 404, body: {"error": "Source not previously added"}});
            var deletion: Promise<any> = instance.removeFolder(localData);

           Promise.all([deletion]).then( function () {
               fulfill( {code: 204, body: {}} );
           })
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
                         let name: string = filename;
                         //inner promise is returned
                         var readfile: Promise<any> = okay.file(filename).async("string")
                             .then(function success(text: string) {

                                 //console.log(text);
                                 var buffer = new Buffer(text);
                                 text = buffer.toString();
                                 //cache data to disk
                                 instance.cacheData(text, name);

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

    cacheData(content: any, filename: string): void
    {
        if (!fs.existsSync("./cache/"))
        {
            fs.mkdirSync("./cache/");
            console.log("new directory created!");
        }

        var path = "./cache/" + filename;

        fs.writeFile(path, content, function(err: any) {
            if (err) {
                console.error("!!!write error:  " + err.message);
            } else {
                console.log("@Successful Write to " + path);
            }
        });
    }

    /**
     * check if given id exists
     *
     * @param id given id that should be searched for
     * @return true if such id exits. false otherwise
     */
    isExist(id: string): boolean
    {
        //since multiple dataset is not allowed for D1 so far
        //id is not used since we are only going to
        //have one dataset at this stage
        var path = "./cache/";
        if (fs.existsSync(path)) {
            return true;
        }
        return false;
    }

    /**
     * delete a given folder recursively
     *
     * @param path given path that need to be deleted
     * @return true a promise to indicate if deletion is successful
     * @credit the following code contains a recursive algorithm that was cited online
     * @reference http://stackoverflow.com/questions/18052762
     */
    removeFolder(path: string): Promise<any>
    {
        return new Promise(function (fulfill, reject) {

        //if path is valid
        if( fs.existsSync(path) ) {
            //go through each file in the folder and delete one by one
            fs.readdirSync(path).forEach(function(file: any){
                var current = path + "/" + file;
                //if current folder contains folder
                if(fs.lstatSync(current).isDirectory()) {
                    //recursive delete for multiple folder
                    this.removeFolder(current).catch(function (err: any) {
                        console.log(err);
                        reject(err);
                    });
                } else {
                    //delete each single file
                    fs.unlinkSync(current);
                }
            });
            //remove entire folder when its empty
            fs.rmdirSync(path);
        }
        fulfill();
        });

    }
}
