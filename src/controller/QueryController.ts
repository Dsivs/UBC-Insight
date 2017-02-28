import {QueryRequest, InsightResponse} from "./IInsightFacade";
import Course from "./Course";
import Room from "./Room";

/**
 * Created by Axiaz on 2017-02-06.
 */

export default class QueryController {

    private IDs: any[];

    constructor() {
        this.IDs = [];
    }

    performQuery(query: QueryRequest, parentInsightFacade: any): Promise<InsightResponse> {
        const instance = this;
        let resultsArray: any[] = [];
        instance.IDs.length = 0;

        return new Promise(function (fulfill, reject) {
            let where: any = query.WHERE;
            let options: any = query.OPTIONS;
            try {
                if (where == undefined)
                    throw({code: 400, body: {error: "WHERE is missing"}});
                if (options == undefined)
                    throw({code: 400, body: {error: "OPTIONS is missing"}});

                options = instance.checkOptions(options);
                let missingIDs: any[] = [];

                if (Object.keys(where).length != 0) {
                    let filterFun = instance.parseFilter(where);

                    if (instance.IDs.length != 1) {
                        for (let id of instance.IDs) {
                            if (id != "courses" && id != "rooms")
                                missingIDs.push(id);
                        }
                        if (missingIDs.length > 0)
                            throw ({code: 424, body: {missing: missingIDs}})
                        else
                            throw ({code: 400, body: {error: "cannot query multiple datasets"}})
                    }

                    let loadedMem = parentInsightFacade.checkMem(instance.IDs[0])

                    for (let obj of loadedMem) {
                        if(filterFun(obj)) {
                            resultsArray.push(obj)
                        }
                    }
                } else {
                    if (instance.IDs.length != 1) {
                        for (let id of instance.IDs) {
                            if (id != "courses" && id != "rooms")
                                missingIDs.push(id);
                        }
                        if (missingIDs.length > 0)
                            throw ({code: 424, body: {missing: missingIDs}})
                        else
                            throw ({code: 400, body: {error: "cannot query multiple datasets"}})
                    }

                    let loadedMem = parentInsightFacade.checkMem(instance.IDs[0]);

                    resultsArray = loadedMem;
                }

                //let columns: any[] = options.COLUMNS;
                let validKeys: any;
                let columns = options.columns;

                switch (instance.IDs[0]) {
                    case "courses":
                        validKeys = Course.courseKeys;
                        break;
                    case "rooms":
                        validKeys = Room.roomKeys;
                }

                for (let column of columns) {
                    if (!validKeys.includes(column))
                        throw ({code: 400, body: {error: column + " is not a valid key"}})
                }

                let outputArray = JSON.parse(JSON.stringify(resultsArray, columns));

                if (options.order != undefined) {
                    let dir = options.order.dir;
                    let keys = options.order.keys;

                    outputArray.sort(function (a: any, b: any) {
                        let i = 0;
                        do {
                            if (a[keys[i]] > b[keys[i]]) {
                                return dir;
                            } else if (a[keys[i]] < b[keys[i]]) {
                                return -dir;
                            }
                            i++;
                        } while (i < keys.length)
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
        instance.checkColumnsOrders(order, columns);

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
            throw ({code: 400, body: {error: "keys must be an array of keys"}})

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
            throw ({code: 400, body: {error: "columns must be an array"}});
        if (columns.length == 0)
            throw ({code: 400, body: {error: "columns cannot be empty"}});

        for (let column of columns) {
            if (!column.includes("_"))
                throw ({code: 400, body: {error: column + " is not a valid key"}})

            let id = column.substring(0, column.indexOf("_"));
            if (!this.IDs.includes(id))
                this.IDs.push(id);
        }
    }

    checkColumnsOrders(order: any, columns: any) {
        if (order != undefined) {
            for (let key of order.keys) {
                if (!columns.includes(key))
                    throw ({code: 400, body: {error: key + " is not in " + columns}})
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
                //if (isUndefined(paramField) || paramField === null)
                    //throw ({code: 400, body: {error: "invalid paramField"}});
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
}