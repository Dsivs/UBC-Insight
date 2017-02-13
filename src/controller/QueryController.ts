import {QueryRequest, InsightResponse} from "./IInsightFacade";
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

                instance.checkOptions(options);
                let filterFun = instance.parseFilter(where);
                if (instance.IDs.length != 1)
                    throw ({code: 400, body: {error: "cannot query multiple datasets"}})

                let loadedMem = parentInsightFacade.checkMem(instance.IDs[0])
                for (let obj of loadedMem) {
                    if(filterFun(obj)) {
                        resultsArray.push(obj)
                    }
                }
                let columns: any[] = options.COLUMNS;
                let outputArray = JSON.parse(JSON.stringify(resultsArray, columns));

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
        let instance = this;
        let columns = options.COLUMNS;
        let order = options.ORDER;
        let form = options.FORM;

        /**
         * COLUMNS must be a non-empty array
         */
        if (!Array.isArray(columns))
            throw ({code: 400, body: {error: "columns must be an array"}});
        if (columns.length == 0)
            throw ({code: 400, body: {error: "columns cannot be empty"}});

        /**
         * if ORDER is specified, it must be included in COLUMNS
         */
        if (order != undefined && !columns.includes(order)) {
            throw ({code: 400, body: {error: order + " is not in " + columns}})
        }

        /**
         * FORM must be === 'TABLE'
         */
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
}