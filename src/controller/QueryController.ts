import {QueryRequest, InsightResponse} from "./IInsightFacade";
import Course from "./Course";
import Room from "./Room";

/**
 * Created by Axiaz on 2017-02-06.
 */

export default class QueryController {

    private readonly validIDs: any[] = ["courses", "rooms"];
    private IDs: any[];

    constructor() {
        this.IDs = [];
    }

    performQuery(query: QueryRequest, parentInsightFacade: any): Promise<InsightResponse> {
        const instance = this;
        let resultsArray: any[] = [];
        instance.IDs.length = 0;

        return new Promise(function (fulfill, reject) {
            try {
                let where: any = query.WHERE;
                let options: any = query.OPTIONS;
                instance.checkWHEREandOPTIONS(where, options);
                options = instance.checkOptions(options);

                /**
                 * Handle Empty WHERE
                 */
                let filterFun = undefined;
                if (Object.keys(where).length != 0)
                    filterFun = instance.parseFilter(where);

                /**
                 * Go over the list of encountered IDs and handle invalid cases
                 */
                let id = instance.checkInvalidIDs();


                let columns = options.columns;

                /**
                 * check validity of TRANSFORMATIONS if present
                 */
                let transformations: any = query.TRANSFORMATIONS;
                instance.checkTFsAndColumnsMatch(transformations, columns, id);

                /**
                 * load up the proper dataset
                 */
                let loadedData = parentInsightFacade.checkMem(id);

                /**
                 * Filter the data if WHERE was not empty, else return all the data
                 */
                if (filterFun != undefined) {
                    for (let obj of loadedData) {
                        if(filterFun(obj)) {
                            resultsArray.push(obj)
                        }
                    }
                } else {
                    resultsArray = loadedData;
                }

                /**
                 * Transform Data
                 */
                resultsArray = instance.transformData(transformations, resultsArray);

                /**
                 * Truncate data to list only COLUMNS
                 */
                resultsArray = JSON.parse(JSON.stringify(resultsArray, columns));

                /**
                 * Sort data if ORDER was present
                 */
                resultsArray = instance.sortData(options.order, resultsArray);

                fulfill({code: 200, body: {render: 'TABLE', result: resultsArray}})
            } catch (err) {
                reject(err)
            }
        });
    }

    /**
     * Checks WHERE and OPTIONS are present
     */
    checkWHEREandOPTIONS(where: any, options: any) {
        if (where == undefined)
            throw({code: 400, body: {error: "WHERE is missing"}});
        if (options == undefined)
            throw({code: 400, body: {error: "OPTIONS is missing"}});
    }

    checkOptions(options: any) {
        let instance = this;
        /**
         * Handle SORT/ORDER
         */
        let order = options.ORDER;
        let orderObj = instance.checkOrder(order);

        /**
         * Handle COLUMNS
         */
        let columns = options.COLUMNS;
        instance.checkColumns(columns);

        /**
         * Check ORDER is included in COLUMNS
         */
        instance.checkColumnsIncludesOrder(orderObj, columns);

        /**
         * FORM must be === 'TABLE'
         */
        let form = options.FORM;
        instance.checkForm(form);

        return {
            order: orderObj,
            columns: columns,
            form: form
        }
    }

    checkOrder(order: any): any {
        let direction = 1;
        if (order == undefined)
            return undefined;

        if (typeof order == "string") {
            return {
                dir: direction,
                keys: [order]
            };
        }

        let dir = order.dir;
        let keys = order.keys;
        switch(dir) {
            case "UP":
                break;
            case "DOWN":
                direction = -1;
                break;
            default:
                throw ({code: 400, body: {error: "dir must be UP or DOWN"}})
        }

        if (!Array.isArray(keys))
            throw ({code: 400, body: {error: "keys must be an array of keys"}});
        if (keys.length == 0)
            throw ({code: 400, body: {error: "keys must not be empty"}});

        return {
            dir: direction,
            keys: keys
        };
    }

    checkColumns(columns: any) {
        /**
         * COLUMNS must be a non-empty array
         */
        if (!Array.isArray(columns))
            throw ({code: 400, body: {error: "COLUMNS must be an array"}});
        if (columns.length == 0)
            throw ({code: 400, body: {error: "COLUMNS cannot be empty"}});

        for (let column of columns) {
            if (column.includes("_")) {
                let id = column.substring(0, column.indexOf("_"));
                if (!this.IDs.includes(id))
                    this.IDs.push(id);
            }
        }
    }

    checkColumnsIncludesOrder(order: any, columns: any) {
        if (order != undefined) {
            for (let key of order.keys) {
                if (!columns.includes(key))
                    throw ({code: 400, body: {error: key + " is not in COLUMNS"}})
            }
        }
    }

    checkForm(form: any) {
        if (form != "TABLE") {
            throw ({code: 400, body: {error: form + " is not equal to TABLE"}})
        }
    }

    parseFilter(filter: any): any {
        let instance = this;
        let numKeys = Object.keys(filter).length;
        if (numKeys != 1)
            throw ({code: 400, body: {error: "filter must have only one key"}});

        let key = Object.keys(filter)[0];
        let keyValue = filter[key];

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
                if (!this.IDs.includes(id))
                    this.IDs.push(id);

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
                    if (courseObj[paramField] == undefined)
                        throw ({code: 400, body: {error: paramField + " is not a valid key"}});
                    if (typeof courseObj[paramField] != typeof paramValue)
                        throw ({code: 400, body: {error: "type of " + paramField + " does not match with key value: " + paramValue}});

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
                let filterFn = instance.parseFilter(keyValue);
                return function (courseObj: any) {
                    return !filterFn(courseObj)
                };
            default:
                throw ({code: 400, body: {error: key + " is not a valid key"}})
        }
    }

    checkInvalidIDs(): any {
        let instance = this;

        if (instance.IDs.length == 1 && instance.validIDs.includes(instance.IDs[0]))
            return instance.IDs[0];

        let missingIDs: any[] = [];
        for (let id of instance.IDs) {
            if (!instance.validIDs.includes(id))
                missingIDs.push(id);
        }
        if (missingIDs.length > 0)
            throw ({code: 424, body: {missing: missingIDs}});
        else
            throw ({code: 400, body: {error: "cannot query multiple datasets"}})
    }

    checkTFsAndColumnsMatch(tfs: any, columns: any, id: any) {
        let instance = this;

        if (tfs == undefined) {
            /**
             * Check that the keys in COLUMNS are all valid
             */
            instance.verifyValidKeys(columns, id);
            return;
        }

        let group = tfs.GROUP;
        let groupKeys: any[] = [];
        let applyKeys: any[] = [];
        let apply = tfs.APPLY;
        if (!Array.isArray(group))
            throw ({code: 400, body: {error: "invalid GROUP"}});
        if (!Array.isArray(apply))
            throw ({code: 400, body: {error: "invalid APPLY"}});

        for (let column of columns) {
            if (column.includes("_"))
                groupKeys.push(column);
            else
                applyKeys.push(column);
        }

        if (groupKeys.length != group.length)
            throw ({code: 400, body: {error: "COLUMNS keys must match GROUP keys"}});
        for (let term of group) {
            if (!groupKeys.includes(term))
                throw ({code: 400, body: {error: "COLUMNS keys must match GROUP keys"}});
        }
        instance.verifyValidKeys(groupKeys, id);

        if (applyKeys.length != apply.length)
            throw ({code: 400, body: {error: "COLUMNS keys must match APPLY keys"}});

        for (let applyKey of apply) {
            if (Object.keys(applyKey).length != 1)
                throw ({code: 400, body: {error: "APPLYKEY must have exactly one string"}});

            let string = Object.keys(applyKey)[0];
            if (!applyKeys.includes(string))
                throw ({code: 400, body: {error: "COLUMNS keys must match APPLY keys"}});

            let applyObj = applyKey[string];
            if (Object.keys(applyObj).length != 1)
                throw ({code: 400, body: {error: "APPLYKEY must have exactly one APPLYTOKEN"}});
            let applyToken = Object.keys(applyObj)[0];

            switch(applyToken) {
                case "MAX":
                case "MIN":
                case "AVG":
                case "COUNT":
                case "SUM":
                    break;
                default:
                    throw ({code: 400, body: {error: applyToken + " is not a valid APPLYKEY property"}});
            }

            let key = applyObj[applyToken];
            instance.verifyValidKeys([key], id);
        }
    }

    verifyValidKeys(keys: any, id: string) {
        let validKeys: any;

        switch (id) {
            case "courses":
                validKeys = Course.courseKeys;
                break;
            case "rooms":
                validKeys = Room.roomKeys;
                break;
        }
        for (let key of keys) {
            if (!key.includes("_"))
                throw ({code: 400, body: {error: key + " is not a valid key"}})

            if (!validKeys.includes(key))
                throw ({code: 400, body: {error: key + " is not a valid key"}})
        }
    }

    transformData(tfs: any, data: any): any {
        if (tfs == undefined)
            return data;

        let instance = this;
        let transformedData: any[] = [];
        let groupedData: any = {};
        let group = tfs.GROUP;
        let apply = tfs.APPLY;

        for (let obj of data) {
            let hash = "";
            for (let term of group) {
                hash += obj[term];
            }
            if (groupedData[hash] == undefined) {
                let newObj: any = {};
                for (let term of group) {
                    newObj[term] = obj[term];
                }
                newObj.num = 0;
                newObj.uniqueVals = [];
                groupedData[hash] = newObj;
            }
            instance.applyTFs(groupedData[hash], obj, apply);
        }

        for (let key in groupedData) {
            transformedData.push(groupedData[key])
        }

        return transformedData;
    }

    applyTFs(group: any, dataObj: any, apply: any): any {
        let instance = this;

        for (let applyKey of apply) {
            let string = Object.keys(applyKey)[0];
            let applyToken = Object.keys(applyKey[string])[0];
            let applyProp = applyKey[string][applyToken];
            let dataValue = dataObj[applyProp];

            switch(applyToken) {
                case "MAX":
                case "MIN":
                case "AVG":
                case "SUM":
                    if (typeof dataValue != "number")
                        throw ({code: 400, body: {error: applyToken + " must be applied to number data"}});
                    instance.doOperations(applyToken, group, string, dataValue);
                    break;
                case "COUNT":
                    instance.doOperations(applyToken, group, string, dataValue);
                    break;
            }
        }
    }

    doOperations(op: any, group: any, field: any, newVal: any) {
        switch(op) {
            case "MAX":
                if (group[field] == undefined)
                    group[field] = newVal;

                if (group[field] < newVal)
                    group[field] = newVal;
                break;
            case "MIN":
                if (group[field] == undefined)
                    group[field] = newVal;

                if (group[field] > newVal)
                    group[field] = newVal;
                break;
            case "SUM":
                if (group[field] == undefined)
                    group[field] = 0;
                    group[field] += newVal;
                break;
            case "AVG":
                if (group[field] == undefined) {
                    group[field] = newVal;
                    group.numBuffer = 1;
                    return;
                }
                group.numBuffer += 1;

                let tempCurVal = group[field]*10;
                tempCurVal = Number(tempCurVal.toFixed(0));
                let tempNewVal = newVal*10;
                tempNewVal = Number(tempNewVal.toFixed(0));
                tempCurVal += tempNewVal;
                tempCurVal /= group.numBuffer;
                tempCurVal /= 10;
                tempCurVal = Number(tempCurVal.toFixed(2));
                group[field] = tempCurVal;
                break;
            case "COUNT":
                if (group[field] == undefined) {
                    group[field] = 1;
                    group.uniqueBuffer = [newVal];
                    return;
                }

                if (!group.uniqueBuffer.includes(newVal)) {
                    group[field] += 1;
                    group.uniqueBuffer.push(newVal);
                }
                break;
        }
    }

    sortData(order: any, data: any[]): any[] {
        if (order == undefined)
            return data;

        let dir = order.dir;
        let keys = order.keys;

        data.sort(function (a: any, b: any) {
            let i = 0;
            do {
                if (a[keys[i]] > b[keys[i]]) {
                    return dir;
                } else if (a[keys[i]] < b[keys[i]]) {
                    return -dir;
                }
                i++;
            } while (i < keys.length);
            return 0;
        });

        return data;
    }
}