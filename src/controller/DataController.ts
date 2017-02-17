import {InsightResponse, GeoResponse} from "./IInsightFacade";
import Course from "./Course";
import {isUndefined} from "util";
import Room from "./Room";
/**
 * Created by Axiaz on 2017-02-06.
 */

const fs = require("fs");
const JSZip = require("jszip");
const http = require('http');
var roomArray: any = [];
var count = 0;
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
                    //console.log(jsonData);
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
            instance.parseToZip(content)
                .then(function (zipContents) {
                    //console.log(zipContents.files)
                    return Promise.all(instance.room_readValidContents(zipContents))
                })
                .then(function (contentArray) {
                    //console.log(arrayOfFileContents);
                    return instance.room_parseContent(contentArray)
                }).then(function (array) {
                    console.log("parseContent is alright");
                    return instance.room_validator(array);
                }).then(function (array) {
                    console.log("validator is alright");
                    return instance.room_addGeo(array);
                })
                .then(function (geoMapping) {

                    instance.room_mapAddrToGeo(geoMapping);

                    return instance.cacheData(JSON.stringify(roomArray, null, 4), id)
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
    private room_readValidContents(zipContents: any): Promise<any>[] {
        let contents: Promise<any>[] = [];
        const instance = this;
        for (let filename in zipContents.files) {
            //if .DS_STORE
            let file = zipContents.file(filename);

            while (filename.indexOf("/") >= 0) {
                filename = filename.substr(filename.indexOf('/') + 1, filename.length - 1)
            }

            if (file != null && filename !== "" && filename !== ".DS_Store") {
                contents.push(file.async("string"));
            }
        }
        return contents;
    }

    private room_addGeo(array: Room[]): Promise<any>
    {
        const instance = this;
        let uniqueAddress: any[] = [];
        let tempArray: Promise<any>[] = [];
        let temp: any = {};

        return new Promise(function (fulfill, reject) {

            for (let room of array) {
                if (!uniqueAddress.includes(room.rooms_address))
                    uniqueAddress.push(room.rooms_address)
            }

            for (let addr of uniqueAddress) {
                tempArray.push(
                    instance.room_fetchGeo(addr)
                        .then(function (result: any) {
                            temp[addr] = result;
                        })
                        .catch(function (err: any) {
                            console.log(err);
                        })
                )
            }

            Promise.all(tempArray)
                .then(function (result) {
                    fulfill(temp);
                })
                .catch(function (err) {
                    reject(err);
                })
        })
    }

    room_fetchGeo(address: string): Promise<any>
    {
        return new Promise(function(fulfill, reject) {
            address = encodeURI(address);

            let url = "http://skaha.cs.ubc.ca:11316/api/v1/team78/" + address;

            let options = {
                hostname: 'skaha.cs.ubc.ca',
                port: 11316,
                path: '/api/v1/team78/' + address,
                method: 'GET',
                agent: false,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            };
            http.get(url, function (res: any) {
                //console.log('http get');
                var data = '';

                res.on('data', function (segment: any) {
                    data += segment.toString();
                });
                res.on('end', function () {
                    fulfill(JSON.parse(data));
                });

                res.on('error', function (err: any) {
                    console.log("HI");
                    console.log(err);
                    reject(err);
                })
            }).end();
        });
    }

    room_mapAddrToGeo(geoMapping: any) {
        for (let room of roomArray) {
            room.rooms_lat = geoMapping[room.rooms_address].lat;
            room.rooms_lon = geoMapping[room.rooms_address].lon;
        }
    }

    private room_parseContent(arrayOfFileContents: string[]): Promise<any> {
        const instance = this;
        return new Promise(function (fulfill, reject) {
            let arrayOfJSONObj: any[] = [];

            for (let fileContent of arrayOfFileContents) {
                var pms = instance.room_htmlParser(fileContent).then(function (array: any){
                    arrayOfJSONObj.push(array);
                }).catch( function (err: any)
                {
                    console.log(err);
                });
            }

            Promise.all([pms]).then( function() {
                if (arrayOfJSONObj.length == 0) {
                    reject({"code": 400, "body": {"error": "Zip contained no valid data"}})
                } else {
                    fulfill(roomArray);
                }
            }).catch( function(){
                reject({"code": 400, "body": {"error": "unknow error"}})
            });
        })
    }

    //turns a html string into a json obj (with room filter)
    private room_htmlParser(content: any): Promise<any>
    {
        const instance = this;
        const parse5 = require('parse5');
        //let res = parse5.parse(content);
        const parser = new parse5.SAXParser({ locationInfo: true });
        let isTbody:boolean = false;
        let isTd:boolean = false;
        let current: string;

        return new Promise( function (fulfill, reject){
            //var fragment = parse5.parseFragment('<tbody></tbody>');
            //fragment = parse5.parseFragment('<tbody></tbody>', {locationInfo: true});
            var Readable = require('stream').Readable;

            //create a readable obj s
            var s = new Readable();
            s.push(content);
            s.push(null);
            s.setEncoding('utf8');
            s.pipe(parser);
            let room: Room;

            parser.on("startTag", (start:any, attribute: any) =>{
                if (start != 'script')
                {
                    if (start === 'tbody')
                        isTbody = true;
                    if (start === 'td' && isTbody)
                        isTd = true;
                    if (isTd == true && isTbody == true)
                    {
                        //console.log("add: " + res);
                        current =  attribute[0].value;
                        //console.log("attri = " + attribute[0].value);
                    }
                    //console.log("->startTag: " + start);
                }
            });
            parser.on("endTag", (res:any) =>{
                if (res === 'td' && isTbody)
                    isTd = false;
                if (res === 'tbody') {
                    isTd = false;
                    isTbody = false;
                    fulfill(roomArray);
                    //console.log(context);
                }
                //console.log("<-endTag: " + res);
            });
            parser.on("comment", (res:any) =>{
                //console.log("//comment: " + res);
            });
            parser.on("doctype", (res:any) =>{
                //console.log("<>doctype: " + res);
            });

            parser.on('text', (res: any) => {
                res = res.trim();
                if (isTd == true && isTbody == true)
                {
                    //console.log("add: " + res);
                    if (res !== "")
                    {
                        //attribute[0].value returns class/href
                        //attribute[0].name returns link of current room
                        //console.log('res = ' + res);
                        //current attribute is url
                        if (current.indexOf('/') >= 0)
                        {
                            if (!isUndefined(room) && room != null
                                && roomArray.indexOf(room) == -1) {
                                //console.log("roomArray ++");
                                roomArray.push(room);
                            }
                            room = instance.room_find(room);
                        }
                        room = instance.room_initialize(current,res,room);
                    }
                }
            });
            //console.log(s);
        });
    }

    private room_initialize(attributes: string, key:string, room: Room): Room
    {
            if (room == null || isUndefined(room))
            {
                return null;
            }
            //debug
            if (key === 'More info')
            {
                return null;
            }
            if (attributes.indexOf('/')>=0 && attributes.charAt(0) === '.' && key !== '') {
                while (attributes.indexOf('/') >= 0) {
                    attributes = attributes.substr(attributes.indexOf('/') + 1, attributes.length)
                }
                room.rooms_shortname = attributes;
                room.rooms_fullname = key;
                return room;
            }

            if (attributes.indexOf('/') >= 0)
            {
                //case attribute is a url, may need regExp to double check
                room.rooms_href = attributes;
                while (attributes.indexOf('/')>=0)
                {
                    attributes = attributes.substr(attributes.indexOf('/')+1, attributes.length)
                }
                room.rooms_shortname = attributes.substr(0,attributes.indexOf('-'));
                room.rooms_number = attributes.substr(attributes.indexOf('-')+1, attributes.length);
                room.rooms_name = room.rooms_shortname + "_"+ room.rooms_number;
                return room;
            }
            while (attributes.indexOf('-') >= 0)
            {
                attributes = attributes.substr(attributes.indexOf('-')+1, attributes.length);
            }

            switch (attributes)
            {
                case 'capacity':
                    room.rooms_seats = parseInt(key);
                    return room;
                case 'furniture':
                    //sample: Classroom-Fixed Tables/Fixed Chairs
                    room.rooms_furniture = key;
                    return room;
                case 'type':
                    //sample: Tiered Large Group
                    room.rooms_type = key;
                    return room;
                case 'address':
                    room.rooms_address = key;
                    return room;
                case 'code':
                    room.rooms_shortname = key;
                    return room;
                case 'nothing':
                case 'image':
                case 'title':
                    return room;
                default:
                    console.log("FETAL ERROR!! Non-Existing room attribute = " + attributes)
            }
    }


    private room_find(room:any)
    {
        if (room == null)
            return new Room();
        for (var i = 0; i< roomArray.length; i++)
        {
            if (isUndefined(room) || room == null)
            {
                console.log("dsd");
            }
            if (roomArray[i].rooms_shortname === room.rooms_shortname)
            {
                return roomArray[i];
            }
        }
        return new Room();
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
    private room_validator(array: Room[]): Promise<any>
    {
        return new Promise( function(fulfill, reject){
            let temp: Room[] = [];
            for(let i = 0; i<array.length; i++)
            {
                if (array[i].rooms_fullname !== 'DEFAULT')
                {
                    temp.push(array[i]);
                    array.splice(i, 1);
                    i = 0;
                }
            }

            let isFound: boolean = false;

            for(let i = 0; i<array.length; i++)
            {
                isFound = false;
                for (let j = 0; j<temp.length;j++) {
                    isFound = true;
                    if (array[i].rooms_shortname === temp[j].rooms_shortname) {

                        array[i].rooms_address = temp[j].rooms_address;
                        array[i].rooms_fullname = temp[j].rooms_fullname;
                        array[i].rooms_lat = temp[j].rooms_lat;
                        array[i].rooms_lon = temp[j].rooms_lon;
                        //j = 0;
                    }
                }
                if(!isFound)
                {
                    //if index.html does not require this room
                    //room info should not be saved
                    array.splice(i, 1);
                    i = 0;
                }
                else if(array[i].rooms_fullname === 'DEFAULT') {
                    array.splice(i, 1);
                    i = 0;
                }
            }
            fulfill(array);

        });
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
                        let year = parseInt(section.Year);
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

        try {
            return JSON.parse(fs.readFileSync(filename, "utf8"));
        } catch (err) {
            throw ({code: 424, body: {error: "missing: " + [id]}});
        }
    }
}

