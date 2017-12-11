import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";
import DataController from "./DataController";

import Log from "../Util";
import QueryController from "./QueryController";

let JSZip = require("jszip");
let fs = require("fs");


export default class InsightFacade implements IInsightFacade {

    private dataController: DataController;
    private queryController: QueryController;

    constructor() {
        Log.trace('InsightFacadeImpl::init()');
        this.dataController = new DataController();
        this.queryController = new QueryController();
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
     * existing id: 201: the operation was successful and the id already existed (was added in
     * this session or was previously cached).
     * new id:   204: the operation was successful and the id was new (not added in this
     * session or was previously cached).
     * error:   400: the operation failed. The body should contain {"error": "my text"}
     * to explain what went wrong.
     *
     */
    addDataset(id: string, content: string): Promise<InsightResponse> {
        const instance = this;

        return new Promise(function (fulfill, reject) {
            switch(id) {
                case "courses":
                    instance.dataController.addCourses(content)
                        .then(function (result: any) {
                            fulfill(result);
                        })
                        .catch(function (err: any) {
                            reject(err);
                        });
                    break;
                case "rooms":
                    instance.dataController.addRooms(content)
                        .then(function (result: any) {
                            fulfill(result);
                        })
                        .catch(function (err: any) {
                            reject(err);
                        });
                    break;
                default:
                    reject({code: 400, body: {error: id + " is not a valid dataset id."}})
            }
        })
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
        const instance = this;

        return new Promise(function (fulfill, reject) {
            instance.dataController.removeDataset((id))
                .then(function (result) {
                    fulfill(result)
                })
                .catch(function (err) {
                    reject(err)
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
     * 424: the query failed because it depends on an id that has not been added. The body should contain {"missing": ["id1", "id2"...]}.
     *
     */
    performQuery(query: QueryRequest): Promise <InsightResponse> {
        //console.log("perform query called");
        const instance = this;
        return new Promise(function (fulfill, reject) {
            instance.queryController.performQuery(query, instance)
                .then(function (result) {
                    //console.log("query ok");
                    fulfill(result)
                })
                .catch(function (err) {
                    //console.log("query rejected");
                    //console.log(err);
                    reject(err)

                })
        })
    }



    /**
     * check if the dataset requested is in memory already, if not try to read it from cache
     */
    checkMem(id: string): any[] {
        const instance = this;
        return instance.dataController.loadCache(id);
    }
}