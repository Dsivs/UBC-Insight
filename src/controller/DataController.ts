import {InsightResponse} from "./IInsightFacade";
import Course from "./Course";
/**
 * Created by Axiaz on 2017-02-06.
 */

const fs = require("fs");
const JSZip = require("jszip");



export default class DataController {

    /**
     * addDataset
     * @param content
     * @returns {Promise<T>}
     */
    addCourses(content: string): Promise<InsightResponse> {
        const instance = this;
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
                    return instance.parseIntoCourses(arrayOfJSONObj)
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
        const instance = this;
        let id = "rooms";

        return new Promise(function (fulfill, reject) {
            //TODO
        })
    }

    //takes in a string and tries to parse it into a JSZip
    private parseToZip(content: string): Promise<any> {
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

    //given a JSZip returns an array of the contents of the files in the JSZip
    private readContents(zipContents: any): Promise<any>[] {
        let arrayOfFileContents: Promise<any>[] = [];

        for (let filename in zipContents.files) {
            let file = zipContents.file(filename);
            if (file != null) {
                arrayOfFileContents.push(file.async("string"))
            }
        }

        return arrayOfFileContents;
    }

    //given an array of file contents returns an array of file contents that are valid json
    private parseFileContents(arrayOfFileContents: string[]): Promise<any> {
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

    //given an array of jsonobjects each corresponding to a file, parse any valid ones into the final course objects to be cached
    private parseIntoCourses(arrayOfJSONObj: any[]): Promise<any> {
        let finalResult: any[] = [];

        return new Promise(function (fulfill, reject) {
            for (let jsonObj of arrayOfJSONObj) {
                let jsonObjResultProp = jsonObj.result;
                if (Array.isArray(jsonObjResultProp)) {
                    for (let section of jsonObjResultProp) {
                        let year = section.Year;
                        if (section.Section === "overall")
                            year = 1900;

                        finalResult.push(new Course(section.Subject,
                                                    section.Course,
                                                    section.Avg,
                                                    section.Professor,
                                                    section.Title,
                                                    section.Pass,
                                                    section.Fail,
                                                    section.Audit,
                                                    section.id.toString(),
                                                    year));
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
    private cacheData(jsonData: string, id: string): Promise<any> {
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


    /**
     * removeDataset
     * @param id
     * @returns {Promise<T>}
     */
    removeDataset(id: string): Promise<InsightResponse> {
        let instance = this;
        let path = "./cache/" + id + "/";
        return new Promise(function (fulfill, reject) {
            instance.readFilesInDir(path)
                .then(function (files) {
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

    private readFilesInDir(path: string): Promise<any> {
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

    private deleteFilesInDir(files: any[], path: string): Promise<any>[] {
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

    private removeDirectory(path: string): Promise<any> {
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
     * checkMem
     */
    loadCache(id: string): any {
        let filename = "./cache/" + id + "/" + id + ".JSON";

        return JSON.parse(fs.readFileSync(filename, "utf8"));
    }
}

