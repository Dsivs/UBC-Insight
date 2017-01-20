/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";

import Log from "../Util";


export default class InsightFacade implements IInsightFacade {

    constructor() {
        Log.trace('InsightFacadeImpl::init()');
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

        return new Promise(function (fulfill, reject) {

            if (!(instance.isBase64(content)))
                reject({code: 400, body: {"error": "Content Not Base64 Encoded"}});

            let decoded: any = instance.decode(content);


            var keys: any=[];
            var values: any=[];
            let i=0;
            for (var key in decoded[0]) {
                keys[i]= key;
                values[i]=content[0][key];
                i=i+1;
            }
            console.log(keys);
            console.log(values);



            fulfill( {code: 201, body: {}} );
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
        //base64 should be multiple of 4 byte string
        if (input.length % 4 !== 0)
            return false;
        //base64 string ends with "="
        if (input.charAt(input.length - 1) !== "=")
            return false;

        return true;
    }
     /**
     * decodes a base64 string to JSON object
     *
     * @param input  given string needs to be decoded
     * @return JSON object
     */
    decode(input: string): any
    {
        var b = new Buffer(input, 'base64');
        input = b.toString();
        return JSON.parse(input);
    }
}
