import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";

import Log from "../Util";
import DataList from "./DataList";
import Course from "./Course";
import CourseList from "./CourseList";
import {isUndefined} from "util";
import {error} from "util";
let JSZip = require("jszip");
let fs = require("fs");

//this is a regular expression to check if given string matches base64 encode characteristic
//a valid base64 string should have A-Z & a-z letters and 0-9 numbers as well as optional "="
let pattern: string = "^[A-Za-z0-9+/=]";

export default class InsightFacade implements IInsightFacade {

    private loadedCourses:  Course[];
    private id:string;
    private invalidIDs: any[];

    constructor() {
        Log.trace('InsightFacadeImpl::init()');
        this.invalidIDs = [];
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
        this.id = id;
        //code will be used for fulfill only
        let code: number = 0;

        return new Promise(function (fulfill, reject) {

            try {

                if (!(instance.isBase64(content)))
                    reject({code: 400, body: {"error": "Content Not Base64 Encoded"}});
                else {
                    //check if data set has been added
                    if (instance.isExist(id)) {
                        //if so, delete and write again
                        code = 201;
                        //remove then add again if already exits
                        /*removal = instance.removeDataset(id).catch(function () {
                         reject({code: 400, body: {"error": "Deletion error"}})
                         });*/
                    }
                    else {
                        code = 204;
                    }

                    //decode base64 content and cache on disk
                    instance.decode(content).then(function () {
                        fulfill({code: code, body: {}});
                    }).catch(function (err) {
                        //console.log(err);
                        reject({code: 400, body: {"error": err.toString()}});
                    });
                }
            }catch (err)
            {
                reject(err);
            }
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
        var path = "./cache/" + id + "/";
        return new Promise(function (fulfill, reject) {
            instance.removeFolder(path)
                .then(function (result) {
                    fulfill(result);
                })
                .catch( function (err) {
                    reject(err);
                });
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
        let instance = this;
        let path: string;
        instance.invalidIDs = [];
        return new Promise(function (fulfill, reject) {

            instance.getId("./cache")
                .then(function (dir: string){
                    path = dir;
                    //console.log("perform for path= " + path);
                    return instance.readDataFiles(path)
                })
                .then(function (listOfFiles: any) {
                    //console.log("readfiles ok")
                    return Promise.all(instance.readFiles(listOfFiles, path));
                })
                .then(function (fileContents: any) {
                    //console.log("loadcourses ok")
                    return instance.loadCoursesIntoArray(fileContents);
                })
                .then(function (result: any) {
                    //console.log("parsequery ok")
                    return instance.parseQuery(query);
                })
                .then(function (result: any) {
                    fulfill(result);
                    fulfill(result);
                })
                .catch(function (err: any) {
                    reject(err);
                })
        });
    }

    loadCoursesIntoArray(fileContents: any): Promise<any> {

        let instance = this;
        return new Promise(function (fulfill, reject) {
            instance.loadedCourses = [];
            fileContents.forEach(function (fileContent: any) {
                fileContent.forEach(function (courseSection: any) {
                    var course = new Course(courseSection.courses_dept,
                        courseSection.courses_id,
                        courseSection.courses_avg,
                        courseSection.courses_instructor,
                        courseSection.courses_title,
                        courseSection.courses_pass,
                        courseSection.courses_fail,
                        courseSection.courses_audit,
                        courseSection.courses_uuid)
                    instance.loadedCourses.push(course);
                    //console.log(course);
                })
            })

            fulfill(0);
        })
    }

    readDataFiles(path: string): Promise<any> {
        return new Promise(function (fulfill, reject) {
            fs.readdir(path, function(err: any, files: any) {
                //console.log(path);

                if (err)
                    reject({code: 404, body: {"error": "Source not previously added"}});
                else
                    fulfill(files);
            })
        })
    }


    readFiles(files: string[], path: string): Promise<any>[] {
        let contents: any[] = [];
        files.forEach(function (element: any) {
            contents.push(new Promise(function (fulfill, reject) {
                let url = path+element;
                //console.log(url);
                try {
                    fulfill(JSON.parse(fs.readFileSync(url, 'utf8')))
                } catch (err) {
                    //console.log(err);
                    reject(err);
                }
            }))
        });

        return contents;
    }
    //returns a existing id path
    getId(path: string): Promise<string>
    {
        return new Promise( function(fulfill, reject){
            //if path is valid
            if( fs.existsSync(path) ) {
                //go through each file in the folder and delete one by one
                fs.readdirSync(path).forEach(function(file: any){
                    var current = path + "/" + file + "/";
                    //if current folder contains folder
                    if(fs.existsSync(current)) {
                        //found a valid file in cache
                        fulfill(current);
                    }
                });
            }
            //if cache folder is empty or cache folder does not exist
            reject(null);
        });
    }


    parseQuery(query: QueryRequest): Promise<any> {
        let instance = this;
        var filter: any;
        var options: any;
        var columns: any[];
        var order: any = null;
        var form: any;
        var columnsOnly: any;
        var queryResults: Promise<any>[] = [];
        var queryOutput: any[] = [];
        return new Promise(function (fulfill, reject) {

            if (query.hasOwnProperty('WHERE') && query.hasOwnProperty('OPTIONS')) {
                filter = query.WHERE;
                options = query.OPTIONS;
            } else {
                reject({code: 400, body: {"error": "Invalid Query"}})
            }
            //console.log("FILTER:");
            //console.log(filter);
            //console.log("OPTIONS:");
            //console.log(options);

            if (options.hasOwnProperty("COLUMNS") && options.hasOwnProperty("FORM")) {
                columns = options.COLUMNS;
                form = options.FORM;
            } else {
                reject({code: 400, body: {"error": "Invalid Query"}})
            }
            if (options.hasOwnProperty("ORDER")) {
                order = options.ORDER;
                if (!columns.includes(order)) {
                    reject({code: 400, body: {"error": "Invalid Query"}});
                }
            }

            if (form !== 'TABLE') {
                reject({code: 400, body: {"error": "Invalid Query"}});
            }

            //all ok here
            //console.log(instance.loadedCourses);

            instance.loadedCourses.forEach(function (course: any) {
                queryResults.push(instance.parseFilter(filter, course));
            })

            Promise.all(queryResults)
                .then(function (result) {
                    if (result.length == 0) {
                        //console.log("GGG");
                        fulfill({code: 200, body: result});
                    }

                    //console.log("GGGGGGGGG");

                    for (var i = 0; i < instance.loadedCourses.length; i++) {
                        if (result[i] === true) {
                            queryOutput.push(instance.loadedCourses[i]);
                        }
                    }

                    //console.log(queryOutput);
                    queryOutput.forEach(function (ele) {
                        columns.forEach(function (column) {
                            if (!ele.hasOwnProperty(column)) {
                                return reject({code: 400, body: {"error": "Invalid Query"}});
                            }
                        })
                    })
                    columnsOnly = JSON.parse(JSON.stringify(queryOutput, columns));
                    //console.log(columnsOnly);
                    if (order != null) {
                        columnsOnly.sort(function(a: any, b: any) {
                            if (a[order] > b[order]) {
                                return 1;
                            } else if (a[order] < b[order]) {
                                return -1;
                            }
                            return 0;
                        })
                    }

                    //console.log(columnsOnly);

                    fulfill({code: 200, body: {render: form, result: columnsOnly}});
                })
                .catch(function (err) {
                    reject(err)
                })
        })
    }

    parseFilter(filter: any, course: any): Promise<any> {
        let instance = this;
        return new Promise(function (fulfill, reject) {
            var keys = Object.keys(filter);

            if (keys.length != 1) {
                reject({code: 400, body: {"error": "Invalid Query"}})
            }

            var key = keys[0];

            //console.log(filter);
            //console.log(keys);
            //console.log(key);

            //if ((avg > 90 && dept === "adhe") || avg === 95)

            switch(key) {
                case "AND":
                    var arrayofFilters = filter[key];
                    if (!Array.isArray(arrayofFilters)) {
                        reject({code: 400, body: {"error": "Invalid Query"}})
                    }
                    Promise.all(arrayofFilters.map(function (ele: any) {
                        return instance.parseFilter(ele, course);
                    }))
                        .then(function (result) {
                            result.forEach(function (ele2) {
                                if (ele2 === false) {
                                    fulfill(false);
                                }
                            })
                            fulfill(true);
                        })
                        .catch(function (err) {
                            reject(err);
                        })
                    break;
                case "OR":
                    var arrayofFilters = filter[key];
                    if (!Array.isArray(arrayofFilters)) {
                        reject({code: 400, body: {"error": "Invalid Query"}})
                    }
                    Promise.all(arrayofFilters.map(function (ele: any) {
                        //console.log(ele);
                        return instance.parseFilter(ele, course);
                    }))
                        .then(function (result) {
                            //console.log(result);
                            result.forEach(function (ele2) {
                                if (ele2 === true) {
                                    fulfill(true);
                                }
                            })
                            fulfill(false);
                        })
                        .catch(function (err) {
                            reject(err);
                        })
                    break;
                case "LT":
                case "GT":
                case "EQ":
                case "IS":
                    // { courses_avg: 85 }
                    var filterParams = filter[key];
                    var paramKeys = Object.keys(filterParams);

                    //console.log("filterParams:")
                    //console.log(filterParams);
                    //console.log("paramKeys:")
                    //console.log(paramKeys);

                    if (paramKeys.length !== 1) {
                        reject({code: 400, body: {"error": "Invalid Query"}})
                    } else {
                        // courses_avg
                        var paramKey = paramKeys[0];
                        if (paramKey.includes("_")) {
                            var id = paramKey.substr(0, paramKey.indexOf("_"));
                            if (id !== "courses") {
                                //console.log("id: " + id)
                                if (!instance.invalidIDs.includes(id)) {
                                    instance.invalidIDs.push(id);
                                }
                                reject(({code: 424, body: {"missing": instance.invalidIDs}}))
                            }
                        }
                        if (course.hasOwnProperty(paramKey)) {
                            var courseValue = course[paramKey];
                            var paramValue = filterParams[paramKey];

                            //console.log("courseValue:");
                            //console.log(courseValue);
                            //console.log("paramValue");
                            //console.log(paramValue);

                        } else {
                            reject({code: 400, body: {"error": "Invalid Query"}})
                        }

                        if (key === "IS") {
                            if (typeof paramValue != "string") {
                                reject(({code: 400, body: {"error": "value of " + key + " must be a string"}}))
                            }
                        } else {
                            if (typeof paramValue != "number") {
                                reject(({code: 400, body: {"error": "value of " + key + " must be a number"}}))
                            }
                        }

                        instance.doOperation(paramValue, courseValue, key)
                            .then(function (result) {
                                fulfill(result);
                            })
                            .catch(function (err) {
                                reject(err)
                            })
                    }
                    break;
                case "NOT":
                    var filterParams = filter[key];
                    instance.parseFilter(filterParams, course)
                        .then(function (result) {
                            fulfill(!result)
                        })
                        .catch(function (err) {
                            reject(err)
                        });
                    break;
                default:
                    reject({code: 400, body: {"error": "Invalid Query"}})
            }
            //fulfill({code: 200, body: {"data": "json"}});
        })
    }

    doOperation(paramValue: any, courseValue: any, operation: any): Promise<any> {
        return new Promise(function (fulfill, reject) {
            switch (operation) {
                case "LT":
                    fulfill(courseValue < paramValue);
                    break;
                case "GT":
                    fulfill(courseValue > paramValue);
                    break;
                case "EQ":
                    fulfill(courseValue === paramValue);
                    break;
                case "IS":
                    var firstWildCard = paramValue.indexOf("*");
                    var lastWildCard = paramValue.lastIndexOf("*");
                    //console.log(firstWildCard + " " + lastWildCard);
                    if (firstWildCard == 0) {
                        if (lastWildCard == paramValue.length-1) {
                            fulfill(courseValue.includes(paramValue.substring(firstWildCard+1, lastWildCard)))
                        }
                        fulfill(courseValue.endsWith(paramValue.substring(1)))
                    } else if (firstWildCard == -1) {
                        fulfill(courseValue === paramValue);
                    }
                    fulfill(courseValue.startsWith(paramValue.substring(0, lastWildCard)))
                    break;
            }
        })
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
        if (isUndefined(input) || input === "" || input === null)
            return false;
        //base64 should be multiple of 4 byte string
        //if (input.length % 4 !== 0)
        //    return false;
        let expression = new RegExp(pattern);
        if (!expression.test(input))
            return false;
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
            try {
                //we need to convert the data back to buffer
                var buffer = new Buffer(input, 'base64');
            }catch (err)
            {
                reject({code: 400, body: {"error": "Content Not Base64 Encoded"}});
            }

            instance.load(buffer)
                .then(function (okay: any)
                {
                    let contentArray: any[] = [];
                    var content: any = "";
                    var readfile: Promise<any>;
                    var dataParsing: Promise<any>;
                    var substring: string = "DEFAULT STRING";

                    for (var filename in okay.files) {
                        let name: string = filename;
                        if (filename.indexOf("/") >= 0)
                        {
                            substring = filename.substr(filename.indexOf('/')+1, filename.length + 1);
                        }
                        if (substring.length == 0 || substring.match(".DS_Store") || substring.match("__MAXOSX"))
                            continue;
                        //if got timeout, this line is the problem
                        if (okay.file(filename) === null)
                            continue;
                        //console.log(filename);
                        //inner promise is returned
                        readfile = okay.file(filename).async("string")
                            .then(function success(text: string) {

                                //console.log("text: " + text);

                                if (isUndefined(text) || (typeof text !== 'string') || !(instance.isJSON(text)))
                                    reject({code: 400, body: {"error": "file content is invalid! because test = " + test}});
                                //console.log(text);
                                var buffer = new Buffer(text);
                                dataParsing = instance.parseData(buffer.toString())
                                    .then( function (result: any) {
                                        contentArray = contentArray.concat(result);
                                        //console.log(contentArray);
                                    })
                                    .catch( function (err: any) {
                                        reject({code: 400, body: {"error": "parse data error-parsedata(buffer) block"}});
                                    });
                            })
                            .catch(function (err: any) {
                                //console.log("err catched for readfile:" + err);
                                //read file error
                                reject({code: 400, body: {"error": "read-file error"}});
                            });
                    }
                    //console.log("fulfill");
                    if (dataParsing) {
                        Promise.all([readfile, dataParsing]).then(function () {
                            content = JSON.stringify(contentArray, null, 4)
                            fulfill(content);

                        }).catch(function (err: any) {
                            reject({code: 400, body: {"error": err.toString()}});
                        });
                    }
                    else {

                        Promise.all([readfile]).then(function () {
                            content = JSON.stringify(contentArray, null, 4)
                            instance.cacheData(content, instance.id)
                                .then(function () {
                                    //console.log("WWWWWW: " + content.charAt(588), content.charAt(600));

                                    fulfill(content);
                                })
                                .catch( function (err: any){
                                    reject({code: 400, body: {"error": "cache data error-catch " +
                                    "cachedata block with error: " + err.toString()}});
                                });

                        }).catch(function (err: any) {
                            reject({code: 400, body: {"error": err.toString()}});
                        });
                    }
                }).catch(function (err) {
                //console.log(err);
                reject({code: 400, body: {"error": err.toString()}});
            });
        });
    }


    load(buffer: any): Promise<any>
    {
        return new Promise(function(fulfill, reject)
        {
            try {
                let zip = new JSZip();
                zip.loadAsync(buffer).then(function (okay: any) {
                    fulfill(okay);
                }).catch(function (err: any) {
                    reject({code: 400, body: {"error": err.toString()}});
                });
            }catch (err)
            {
                reject(err);
            }
        });
    }

    cacheData(content: any, filename: string): Promise<any>
    {

        //case inner folder is found
        while (filename.indexOf("/") >= 0)
        {
            filename = filename.substr(filename.indexOf('/')+1, filename.length + 1);
        }

        //console.log("cache requested for (" + filename + ")");
        let instance = this;
        return new Promise( function (fulfill, reject) {


            if (!fs.existsSync("./cache/")) {
                fs.mkdirSync("./cache/");
                //console.log("new directory created!");
            }

            if (!isUndefined(instance.id)) {
                if (!fs.existsSync("./cache/" + instance.id + "/")) {
                    fs.mkdirSync("./cache/" + instance.id + "/");
                    //console.log("new directory created!");
                }

                var path = "./cache/" + instance.id + "/" + filename + ".JSON";

                fs.writeFile(path, content,function (err: any) {
                    if (err)
                        reject({code: 400, body: {"error": "Write File Failed!"}});
                    else
                        fulfill(0);
                });


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
        var path = "./cache/" + id + "/";
        if (fs.existsSync(path)) {
            return true;
        }
        return false;
    }


    isCached(): boolean
    {
        var path = "./cache/";
        if (fs.existsSync(path)) {
            return true;
        }
        return false;
    }

    isJSON(str: string): boolean
    {
        try
        {
            JSON.parse(str);

        }catch (err)
        {
            return false;
        }

        return true;
    }

    /**
     * delete a given folder recursively
     *
     * @param path given path that need to be deleted
     * @return true a promise to indicate if deletion is successful
     * @credit the following code contains a recursive algorithm that was cited online
     * and has been reviewed by one of lab TA.
     * @reference http://stackoverflow.com/questions/18052762
     */
    /*
     removeFolder(path: string): Promise<any>
     {
     let instance = this;
     return new Promise(function (fulfill, reject) {
     //if path is valid
     if( fs.existsSync(path) ) {
     //go through each file in the folder and delete one by one
     fs.readdirSync(path).forEach(function(file: any){
     var current = path + "/" + file;
     //if current folder contains folder
     if(fs.lstatSync(current).isDirectory()) {
     //recursive delete for multiple folder
     instance.removeFolder(current).catch(function (err: any) {
     console.log(err);
     reject({code: 400, body: {"error": err.toString()}});
     });
     } else {
     //delete each single file
     fs.unlinkSync(current);
     //console.log(current);
     }
     });
     //remove entire folder when its empty
     console.log(fs.readdirSync(path));
     fs.rmdirSync(path);
     }
     fulfill();
     });
     }
     */
    removeFolder(path: string): Promise<any> {
        let instance = this;
        return new Promise(function (fulfill, reject) {
            instance.readDataFiles(path)
                .then(function (files: any) {
                    return Promise.all(instance.removeFiles(path, files))
                })
                .then(function (result) {

                    return instance.removeDirectory(path);
                })
                .then(function (result2) {
                    fulfill(result2)
                })
                .catch(function (err) {
                    reject(err)
                })
        })
    }

    removeFiles(path: string, listofFiles: any[]): Promise<any>[] {
        var output: Promise<any>[] = []
        listofFiles.forEach(function (file) {
            output.push(new Promise(function (fulfill, reject) {
                fs.unlink(path+file, function(err: any) {
                    if (err) {
                        reject({code: 404, body: {"error": "Source not previously added"}});
                    } else {
                        fulfill({code: 204, body: {}})
                    }
                })
            }))
        })

        return output;
    }

    removeDirectory(path: string): Promise<any> {
        return new Promise(function (fulfill, reject) {
            fs.rmdir(path, function (err: any) {
                if (err) {
                    //console.log(path)
                    reject({code: 400, body: {"error:": "not empty"}});
                }
                fulfill({code: 204, body: {}})
            })
        })
    }

    parseData(stringObj: string): Promise<any> {
        return new Promise(function (fulfill, reject) {
            var jsonObj: any;
            var output: any[] = [];
            try {
                jsonObj = JSON.parse(stringObj);
            } catch (err) {
                reject("Not Valid JSON");
            }

            jsonObj.result.forEach(function (element: any) {
                var course = {
                    "courses_dept": element.Subject,
                    "courses_id": element.Course,
                    "courses_avg": element.Avg,
                    "courses_instructor": element.Professor,
                    "courses_title": element.Title,
                    "courses_pass": element.Pass,
                    "courses_fail": element.Fail,
                    "courses_audit": element.Audit,
                    "courses_uuid": element.id
                };
                output.push(course);
            });

            fulfill(output);
        })
    }
}