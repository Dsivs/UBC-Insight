import {InsightResponse} from "./IInsightFacade";
/**
 * Created by Axiaz on 2017-02-06.
 */

export default class DataController {


    addDataset(id: string, content: string): Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {
            switch(id) {
                case "courses":
                    this.addCourses(content)
                        .then(function (result: any) {
                            fulfill(result);
                        })
                        .catch(function (err: any) {
                            reject(err);
                        });
                    break;
                case "rooms":
                    this.addRooms(content)
                        .then(function (result: any) {
                            fulfill(result);
                        })
                        .catch(function (err: any) {
                            reject(err);
                        });
                    break;
                default:
                    reject({code: 400, body: {error: content + " is not a valid dataset id."}})
            }
        })
    }

    addCourses(content: string): Promise<InsightResponse> {
        let instance = this;
        let id = "courses";

        return new Promise(function (fulfill, reject) {
            instance.parseToZip(content)
                .then(function (zipContents) {
                    //console.log(zipContents.files)
                    return Promise.all(instance.readContents(zipContents))
                })
                .then(function (arrayOfFileContents) {
                    //console.log(arrayOfFileContents);
                    return instance.parseFileContents(arrayOfFileContents)
                })
                .then(function (arrayOfJSONObj) {
                    //console.log(arrayOfJSONObj)
                    return instance.parseIntoResult(arrayOfJSONObj)
                })
                .then(function (jsonData) {
                    //console.log(result)
                    return instance.cacheData(JSON.stringify(jsonData, null, 4), id)
                })
                .then(function (result) {
                    fulfill(result)
                })
                .catch(function (err) {
                    //console.log(err);
                    reject(err);
                });
        });
    }

    addRooms(content: string): Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {
            //TODO
        })
    }

    //given a JSZip returns an array of the contents of the files in the JSZip
    readContents(zipContents: any): Promise<any>[] {
        let arrayOfFileContents: Promise<any>[] = [];

        for (let filename in zipContents.files) {
            let file = zipContents.file(filename);
            if (file != null) {
                arrayOfFileContents.push(file.async("string"))
            }
        }

        return arrayOfFileContents;
    }

    //takes in a string and tries to parse it into a JSZip
    parseToZip(content: string): Promise<any> {
        return new Promise(function(fulfill, reject) {
            let zip = new JSZip();
            zip.loadAsync(content, {base64:true})
                .then(function (result: any) {
                    fulfill(result);
                })
                .catch(function (err: any) {
                    reject({"code": 400, body: {"error": "Content is not a valid base64 zip"}});
                })
        })
    }

    //given an array of file contents returns an array of file contents that are valid json
    parseFileContents(arrayOfFileContents: string[]): Promise<any> {
        return new Promise(function (fulfill, reject) {
            let arrayOfJSONObj: any[] = [];

            for (let fileContent of arrayOfFileContents) {
                try {
                    arrayOfJSONObj.push(JSON.parse(fileContent));
                } catch (err) {
                    //console.log("This is not valid JSON:")
                    //console.log(fileContent)
                }
            }

            if (arrayOfJSONObj.length == 0) {
                reject({"code": 400, "body": {"error": "Zip contained no valid data"}})
            } else {
                fulfill(arrayOfJSONObj)
            }
        })
    }

    //given an array of jsonobjects each corresponding to a file, parse any valid ones into the final content to be cached
    parseIntoResult(arrayOfJSONObj: any[]): Promise<any> {
        let finalResult: any[] = [];

        return new Promise(function (fulfill, reject) {
            for (let jsonObj of arrayOfJSONObj) {
                let jsonObjResultProp = jsonObj.result;
                if (Array.isArray(jsonObjResultProp)) {
                    for (let section of jsonObjResultProp) {
                        let course = {
                            "courses_dept": section.Subject,
                            "courses_id": section.Course,
                            "courses_avg": section.Avg,
                            "courses_instructor": section.Professor,
                            "courses_title": section.Title,
                            "courses_pass": section.Pass,
                            "courses_fail": section.Fail,
                            "courses_audit": section.Audit,
                            "courses_uuid": section.id.toString()
                        };
                        finalResult.push(course);
                    }
                }
            }
            if (finalResult.length == 0) {
                reject({"code": 400, "body": {"error": "Zip contained no valid data"}})
            } else {
                fulfill(finalResult)
            }
        })
    }

    //given the array of course sections, cache it to disk
    cacheData(jsonData: string, id: string): Promise<any> {
        let fs = require("fs");
        let path = "./cache/";
        let code: number = 201;
        return new Promise(function (fulfill, reject) {
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
            }
            path = path + id + "/";
            if (!fs.existsSync(path)) {
                code = 204;
                fs.mkdirSync(path);
            }

            path = path + id + ".JSON";

            fs.writeFile(path, jsonData, function (err: any) {
                if (err) {

                } else {
                    fulfill({"code": code, "body": {}})
                }
            })
        })
    }

}

