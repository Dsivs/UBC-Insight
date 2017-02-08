import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";
import DataController from "./DataController";

import Log from "../Util";
import QueryController from "./QueryController";
let JSZip = require("jszip");
let fs = require("fs");

export default class InsightFacade implements IInsightFacade {

    private loadedCourses:  any[];
    private invalidIDs: any[];
    private dataController: DataController;
    private queryController: QueryController;

    constructor() {
        Log.trace('InsightFacadeImpl::init()');
        this.loadedCourses = [];
        this.invalidIDs = [];
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
            this.dataController.addDataset(id, content)
                .then(function (result: any) {
                    fulfill(result);
                })
                .catch(function (err: any) {
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
        instance.loadedCourses.length = 0;
        instance.invalidIDs.length = 0;
        let path = "./cache/" + id + "/";
        return new Promise(function (fulfill, reject) {
            instance.readFilesInDir(path)
                .then(function (files) {
                    console.log(files);
                    return Promise.all(instance.deleteFilesInDir(files, path))
                })
                .then(function (result) {
                    return instance.removeDirectory(path)
                })
                .then(function (result2) {
                    fulfill(result2)
                })
                .catch(function (err) {
                    reject(err);
                });
        });
    }

    readFilesInDir(path: string): Promise<any> {
        return new Promise(function (fulfill, reject) {
            fs.readdir(path, function (err: any, files: any) {
                if (err) {
                    reject({code: 404, "body": {"error": "source not previously added"}})
                } else {
                    fulfill(files);
                }
            })
        })
    }

    deleteFilesInDir(files: any[], path: string): Promise<any>[] {
        let results: Promise<any>[] = [];

        for (let file of files) {
            results.push(new Promise(function (fulfill, reject) {
                fs.unlink(path+file, function (err: any) {
                    if (err) {
                        //reject({code: 404, body: {"error": "error deleting file"}})
                    }
                    //console.log("removed " + file)
                    fulfill({code: 204, body: {}})
                })
            }))
        }

        return results;
    }

    removeDirectory(path: string): Promise<any> {
        return new Promise(function (fulfill, reject) {
            fs.rmdir(path, function (err: any) {
                if (err) {
                    //console.log(path)
                    //reject({code: 404, body: {"error:": "not empty"}});
                }
                fulfill({code: 204, body: {}})
            })
        })
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
        let instance = this;
        let resultsArray: any[] = [];
        instance.invalidIDs = [];

        return new Promise(function (fulfill, reject) {
            let where: any = query.WHERE;
            let options: any = query.OPTIONS;
            try {
                if (where == undefined)
                    throw({code: 400, body: {error: "WHERE is missing"}});
                if (options == undefined)
                    throw({code: 400, body: {error: "OPTIONS is missing"}});

                instance.checkOptions(options);
                let filterFun = instance.parseFilter(where);
                //console.log(filterFun.toString())
                for (let course of instance.loadedCourses) {
                    if(filterFun(course)) {
                        resultsArray.push(course)
                    }
                }
                //console.log(resultsArray)
                let columns: any[] = options.COLUMNS;
                let outputArray = JSON.parse(JSON.stringify(resultsArray, columns, 4));
                //console.log(outputArray);
                let order = options.ORDER;
                if (order != undefined) {
                    outputArray.sort(function (a: any, b: any) {
                        if (a[order] > b[order]) {
                            return 1;
                        } else if (a[order] < b[order]) {
                            return -1;
                        }
                        return 0;
                    })
                }
                fulfill({code: 200, body: {render: 'TABLE', result: outputArray}})
            } catch (err) {
                reject(err)
            }
        });
    }

    checkOptions(options: any) {
        let columns = options.COLUMNS;
        let order = options.ORDER;
        let form = options.FORM;
        //console.log(columns)
        //console.log(order)
        //console.log(form)

        if (!Array.isArray(columns)) {
            throw ({code: 400, body: {error: "columns must be an array"}})
        }

        if (columns.length == 0) {
            throw ({code: 400, body: {error: "columns cannot be empty"}})
        }

        if (order != undefined && !columns.includes(order)) {
            throw ({code: 400, body: {error: order + " is not in " + columns}})
        }

        if (form != "TABLE") {
            throw ({code: 400, body: {error: form + " is not equal to TABLE"}})
        }



        for (let column of columns) {
            if (!column.includes("_"))
                throw ({code: 400, body: {error: column + " is not a valid key"}});
            let id = column.substring(0, column.indexOf("_"));
            if (id != "courses") {
                this.invalidIDs.push(id);
                throw ({code: 424, body: {missing: this.invalidIDs}})
            }
        }
    }

    parseFilter(filter: any): any {
        let instance = this;
        let numKeys = Object.keys(filter).length;
        if (numKeys != 1)
            throw ({code: 400, body: {error: "filter must have only one key"}});

        let key = Object.keys(filter)[0];
        //console.log(key);
        let keyValue = filter[key];
        //console.log(keyValue);

        switch (key) {
            case "OR":
            case "AND":
                let arrayOfFilterFn: any[] = [];
                if (!Array.isArray(keyValue))
                    throw ({code: 400, body: {error: "value of " + key + " must be an array"}});
                if (keyValue.length == 0)
                    throw ({code: 400, body: {error: key + " must have at least one key"}});
                for (let filter of keyValue) {
                    arrayOfFilterFn.push(instance.parseFilter(filter))
                }

                switch (key) {
                    case "OR":
                        return function (CourseObj: any) {
                            let result: boolean = false;
                            for (let filter of arrayOfFilterFn) {
                                result = result || filter(CourseObj)
                            }
                            return result;
                        };

                    case "AND":
                        return function(CourseObj: any) {
                            let result: boolean = true;
                            for (let filter of arrayOfFilterFn) {
                                result = result && filter(CourseObj)
                            }
                            return result;
                        }
                }
            case "GT":
            case "EQ":
            case "LT":
            case "IS":
                let paramFieldLength = Object.keys(keyValue).length;
                if (paramFieldLength != 1)
                    throw ({code: 400, body: {error: key + " must have exactly one key"}});
                let paramField = Object.keys(keyValue)[0];
                let paramValue = keyValue[paramField];
                if (!paramField.includes("_"))
                    throw ({code: 400, body: {error: paramField + " is not a valid key"}});
                let id = paramField.substring(0, paramField.indexOf("_"));
                if (id != "courses") {
                    if (!this.invalidIDs.includes(id))
                        this.invalidIDs.push(id);
                    throw ({code: 424, body: {missing: this.invalidIDs}})
                }
                //console.log(paramField)
                //console.log(paramValue);
                switch (key) {
                    case "GT":
                    case "EQ":
                    case "LT":
                        if (typeof paramValue != "number")
                            throw ({code: 400, body: {error: "value of " + key + " must be a number"}});
                        break;
                    case "IS":
                        if (typeof paramValue != "string")
                            throw ({code: 400, body: {error: "value of " + key + " must be a string"}});
                        break;
                }
                return function (courseObj: any) {
                    if (courseObj[paramField] === undefined)
                        throw ({code: 400, body: {error: paramField + " is not a valid key"}});

                    switch (key) {
                        case "GT":
                            return courseObj[paramField] > paramValue;
                        case "EQ":
                            return courseObj[paramField] == paramValue;
                        case "LT":
                            return courseObj[paramField] < paramValue;
                        case "IS":
                            let firstWild = paramValue.startsWith("*");
                            let secondWild = paramValue.endsWith("*");
                            if (firstWild && secondWild) {
                                return courseObj[paramField].includes(paramValue.substring(1, paramValue.length-1));
                            } else if (firstWild) {
                                return courseObj[paramField].endsWith(paramValue.substring(1))
                            } else if (secondWild) {
                                return courseObj[paramField].startsWith(paramValue.substring(0, paramValue.length-1))
                            } else {
                                return courseObj[paramField] === paramValue;
                            }
                    }
                };
            case "NOT":
                //console.log("HI")
                //console.log(instance.parseFilter(keyValue).toString())
                let filterFn = instance.parseFilter(keyValue);
                return function (courseObj: any) {
                    return !filterFn(courseObj)
                };
            default:
                throw ({code: 400, body: {error: key + " is not a valid key"}})
        }
    }
}