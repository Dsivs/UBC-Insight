/**
 * Created by John on 2017-02-08.
 */

import {isUndefined} from "util";
import Log from "../src/Util";
import InsightFacade from "../src/controller/InsightFacade";
const fs = require("fs");
let roomContent: string = "";
let courseContent: string = "";
const emptyArray: any[] = [];
import {expect} from 'chai';

describe("Transformations Validity Test", function () {

    this.timeout(50000);
    let insight = new InsightFacade();
    before(function (done) {

        Log.test('Before: ' + (<any>this).test.parent.title);
        fs.readFile('./zips/rooms.zip', function (err: any, data: any) {
            if (err) {
                //invalid zip file is given
                console.log(err);
            }
            else if (!isUndefined(data) || data !== null) {
                //debug, if given content is invalid
                //since given data is a array buffer, we can convert right away
                roomContent = data.toString('base64');
                console.log("Before: content is done!");
            }
        });

        fs.readFile('./zips/courses.zip', function (err: any, data: any) {
            if (err) {
                //invalid zip file is given
                console.log(err);
            }
            else if (!isUndefined(data) || data !== null) {
                //debug, if given content is invalid
                //since given data is a array buffer, we can convert right away
                courseContent = data.toString('base64');
                console.log("Before: content is done!");
                done();
            }
        });
    });

    it("add rooms", function () {
        return insight.addDataset('rooms', roomContent)
            .then(function(response) {
                expect(response.code).to.deep.equal(204);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });
    it("add courses", function () {
        return insight.addDataset('courses', courseContent)
            .then(function(response) {
                expect(response.code).to.deep.equal(204);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });

    /**
     * invalid GROUP Query
     */
    const invalidGROUPQuery = {
        "WHERE": {
            "IS": {
                "rooms_furniture": "*Tables*"
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "rooms_shortname",
                "maxSeats"
            ],
            "ORDER": "maxSeats",
            "FORM": "TABLE"
        },
        "TRANSFORMATIONS": {
            "GROUP": "rooms_shortname",
            "APPLY": [{
                "maxSeats": {
                    "MAX": "rooms_seats"
                }
            }]
        }
    };
    it("invalid GROUP Query", function() {
        return insight.performQuery(invalidGROUPQuery)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "invalid GROUP"});
            })
    });

    /**
     * empty GROUP Query
     */
    const emptyGROUPQuery = {
        "WHERE": {
            "IS": {
                "rooms_furniture": "*Tables*"
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "rooms_shortname",
                "maxSeats"
            ],
            "ORDER": "maxSeats",
            "FORM": "TABLE"
        },
        "TRANSFORMATIONS": {
            "GROUP": emptyArray,
            "APPLY": [{
                "maxSeats": {
                    "MAX": "rooms_seats"
                }
            }]
        }
    };
    it("empty GROUP Query", function() {
        return insight.performQuery(emptyGROUPQuery)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "COLUMNS keys must match GROUP keys"});
            })
    });

    /**
     * invalid APPLY Query
     */
    const invalidAPPLYQuery = {
        "WHERE": {
            "IS": {
                "rooms_furniture": "*Tables*"
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "rooms_shortname",
                "maxSeats"
            ],
            "ORDER": "maxSeats",
            "FORM": "TABLE"
        },
        "TRANSFORMATIONS": {
            "GROUP": ["rooms_shortname"],
            "APPLY": "lol"
        }
    };
    it("invalid APPLY Query", function() {
        return insight.performQuery(invalidAPPLYQuery)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "invalid APPLY"});
            })
    });

    /**
     * GROUP keys do not match COLUMNS keys Query
     */
    const GroupColumnsMismatchQuery = {
        "WHERE": {
            "IS": {
                "rooms_furniture": "*Tables*"
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "rooms_shortname",
                "maxSeats"
            ],
            "ORDER": "maxSeats",
            "FORM": "TABLE"
        },
        "TRANSFORMATIONS": {
            "GROUP": ["ayy_lmao"],
            "APPLY": [{
                "maxSeats": {
                    "MAX": "rooms_seats"
                }
            }]
        }
    };
    it("GROUP keys do not match COLUMNS keys Query", function() {
        return insight.performQuery(GroupColumnsMismatchQuery)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "COLUMNS keys must match GROUP keys"});
            })
    });

    /**
     * num of APPLY keys does not match num of no underscore keys in Columns Query
     */
    const ApplyColumnsMismatchQuery1 = {
        "WHERE": {
            "IS": {
                "rooms_furniture": "*Tables*"
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "rooms_shortname",
                "maxSeats",
                "maxLat"
            ],
            "ORDER": "maxSeats",
            "FORM": "TABLE"
        },
        "TRANSFORMATIONS": {
            "GROUP": ["rooms_shortname"],
            "APPLY": [{
                "maxSeats": {
                    "MAX": "rooms_seats"
                }
            }]
        }
    };
    it("num of APPLY keys does not match num of no underscore keys in Columns Query", function() {
        return insight.performQuery(ApplyColumnsMismatchQuery1)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "COLUMNS keys must match APPLY keys"});
            })
    });

    /**
     * APPLY keys do not match no underscore keys in Columns Query
     */
    const ApplyColumnsMismatchQuery2 = {
            "WHERE": {
                "IS": {
                    "rooms_furniture": "*Tables*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxLat"
                ],
                "ORDER": "maxLat",
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seats"
                    }
                }]
            }
        };
    it("APPLY keys do not match no underscore keys in Columns Query", function() {
        return insight.performQuery(ApplyColumnsMismatchQuery2)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "COLUMNS keys must match APPLY keys"});
            })
    });

    /**
     * APPLY keys do not match no underscore keys in Columns Query
     */
    const ApplyColumnsQuery = {
        "WHERE": {
        },
        "OPTIONS": {
            "COLUMNS": [
                "rooms_shortname",
                "maxLat"
            ],
            "ORDER": "maxLat",
            "FORM": "TABLE"
        },
        "TRANSFORMATIONS": {
            "GROUP": ["rooms_shortname", "rooms_name"],
            "APPLY": [{
                "maxSeats": {
                    "MAX": "rooms_seats"
                }
            },
                {
                    "maxLat": {
                        "MAX": "rooms_lat"
                    }
                },
                {
                    "maadaLat": {
                        "MAX": "rooms_lat"
                    }
                }]
        }
    };

    //const res = {"render":"TABLE","result":[{"rooms_shortname":"FSC","maxLat":49.26044},{"rooms_shortname":"FSC","maxLat":49.26044},{"rooms_shortname":"FSC","maxLat":49.26044},{"rooms_shortname":"FSC","maxLat":49.26044},{"rooms_shortname":"FSC","maxLat":49.26044},{"rooms_shortname":"FSC","maxLat":49.26044},{"rooms_shortname":"FSC","maxLat":49.26044},{"rooms_shortname":"FSC","maxLat":49.26044},{"rooms_shortname":"FSC","maxLat":49.26044},{"rooms_shortname":"FSC","maxLat":49.26044},{"rooms_shortname":"OSBO","maxLat":49.26047},{"rooms_shortname":"OSBO","maxLat":49.26047},{"rooms_shortname":"OSBO","maxLat":49.26047},{"rooms_shortname":"ORCH","maxLat":49.26048},{"rooms_shortname":"ORCH","maxLat":49.26048},{"rooms_shortname":"ORCH","maxLat":49.26048},{"rooms_shortname":"ORCH","maxLat":49.26048},{"rooms_shortname":"ORCH","maxLat":49.26048},{"rooms_shortname":"ORCH","maxLat":49.26048},{"rooms_shortname":"ORCH","maxLat":49.26048},{"rooms_shortname":"ORCH","maxLat":49.26048},{"rooms_shortname":"ORCH","maxLat":49.26048},{"rooms_shortname":"ORCH","maxLat":49.26048},{"rooms_shortname":"ORCH","maxLat":49.26048},{"rooms_shortname":"ORCH","maxLat":49.26048},{"rooms_shortname":"ORCH","maxLat":49.26048},{"rooms_shortname":"ORCH","maxLat":49.26048},{"rooms_shortname":"ORCH","maxLat":49.26048},{"rooms_shortname":"ORCH","maxLat":49.26048},{"rooms_shortname":"ORCH","maxLat":49.26048},{"rooms_shortname":"ORCH","maxLat":49.26048},{"rooms_shortname":"ORCH","maxLat":49.26048},{"rooms_shortname":"ORCH","maxLat":49.26048},{"rooms_shortname":"ORCH","maxLat":49.26048},{"rooms_shortname":"MCML","maxLat":49.26114},{"rooms_shortname":"MCML","maxLat":49.26114},{"rooms_shortname":"MCML","maxLat":49.26114},{"rooms_shortname":"MCML","maxLat":49.26114},{"rooms_shortname":"MCML","maxLat":49.26114},{"rooms_shortname":"MCML","maxLat":49.26114},{"rooms_shortname":"MCML","maxLat":49.26114},{"rooms_shortname":"MCML","maxLat":49.26114},{"rooms_shortname":"MCML","maxLat":49.26114},{"rooms_shortname":"MCML","maxLat":49.26114},{"rooms_shortname":"MCML","maxLat":49.26114},{"rooms_shortname":"MCML","maxLat":49.26114},{"rooms_shortname":"MCML","maxLat":49.26114},{"rooms_shortname":"MCML","maxLat":49.26114},{"rooms_shortname":"MCML","maxLat":49.26114},{"rooms_shortname":"MCML","maxLat":49.26114},{"rooms_shortname":"MCML","maxLat":49.26114},{"rooms_shortname":"MCML","maxLat":49.26114},{"rooms_shortname":"MCML","maxLat":49.26114},{"rooms_shortname":"DMP","maxLat":49.26125},{"rooms_shortname":"DMP","maxLat":49.26125},{"rooms_shortname":"DMP","maxLat":49.26125},{"rooms_shortname":"DMP","maxLat":49.26125},{"rooms_shortname":"DMP","maxLat":49.26125},{"rooms_shortname":"MCLD","maxLat":49.26176},{"rooms_shortname":"MCLD","maxLat":49.26176},{"rooms_shortname":"MCLD","maxLat":49.26176},{"rooms_shortname":"MCLD","maxLat":49.26176},{"rooms_shortname":"MCLD","maxLat":49.26176},{"rooms_shortname":"MCLD","maxLat":49.26176},{"rooms_shortname":"FORW","maxLat":49.26176},{"rooms_shortname":"FORW","maxLat":49.26176},{"rooms_shortname":"FORW","maxLat":49.26176},{"rooms_shortname":"CIRS","maxLat":49.26207},{"rooms_shortname":"CHBE","maxLat":49.26228},{"rooms_shortname":"CHBE","maxLat":49.26228},{"rooms_shortname":"EOSM","maxLat":49.26228},{"rooms_shortname":"CHBE","maxLat":49.26228},{"rooms_shortname":"PHRM","maxLat":49.26229},{"rooms_shortname":"PHRM","maxLat":49.26229},{"rooms_shortname":"PHRM","maxLat":49.26229},{"rooms_shortname":"PHRM","maxLat":49.26229},{"rooms_shortname":"PHRM","maxLat":49.26229},{"rooms_shortname":"PHRM","maxLat":49.26229},{"rooms_shortname":"PHRM","maxLat":49.26229},{"rooms_shortname":"PHRM","maxLat":49.26229},{"rooms_shortname":"PHRM","maxLat":49.26229},{"rooms_shortname":"PHRM","maxLat":49.26229},{"rooms_shortname":"PHRM","maxLat":49.26229},{"rooms_shortname":"LSC","maxLat":49.26236},{"rooms_shortname":"LSC","maxLat":49.26236},{"rooms_shortname":"LSC","maxLat":49.26236},{"rooms_shortname":"CEME","maxLat":49.26273},{"rooms_shortname":"CEME","maxLat":49.26273},{"rooms_shortname":"CEME","maxLat":49.26273},{"rooms_shortname":"CEME","maxLat":49.26273},{"rooms_shortname":"CEME","maxLat":49.26273},{"rooms_shortname":"CEME","maxLat":49.26273},{"rooms_shortname":"ESB","maxLat":49.26274},{"rooms_shortname":"ESB","maxLat":49.26274},{"rooms_shortname":"ESB","maxLat":49.26274},{"rooms_shortname":"SWNG","maxLat":49.26293},{"rooms_shortname":"SWNG","maxLat":49.26293},{"rooms_shortname":"SWNG","maxLat":49.26293},{"rooms_shortname":"SWNG","maxLat":49.26293},{"rooms_shortname":"SWNG","maxLat":49.26293},{"rooms_shortname":"SWNG","maxLat":49.26293},{"rooms_shortname":"SWNG","maxLat":49.26293},{"rooms_shortname":"SWNG","maxLat":49.26293},{"rooms_shortname":"SWNG","maxLat":49.26293},{"rooms_shortname":"SWNG","maxLat":49.26293},{"rooms_shortname":"SWNG","maxLat":49.26293},{"rooms_shortname":"SWNG","maxLat":49.26293},{"rooms_shortname":"SWNG","maxLat":49.26293},{"rooms_shortname":"SWNG","maxLat":49.26293},{"rooms_shortname":"SWNG","maxLat":49.26293},{"rooms_shortname":"SWNG","maxLat":49.26293},{"rooms_shortname":"SWNG","maxLat":49.26293},{"rooms_shortname":"SWNG","maxLat":49.26293},{"rooms_shortname":"SWNG","maxLat":49.26293},{"rooms_shortname":"SWNG","maxLat":49.26293},{"rooms_shortname":"SWNG","maxLat":49.26293},{"rooms_shortname":"SWNG","maxLat":49.26293},{"rooms_shortname":"AERL","maxLat":49.26372},{"rooms_shortname":"SCRF","maxLat":49.26398},{"rooms_shortname":"SCRF","maxLat":49.26398},{"rooms_shortname":"SCRF","maxLat":49.26398},{"rooms_shortname":"SCRF","maxLat":49.26398},{"rooms_shortname":"SCRF","maxLat":49.26398},{"rooms_shortname":"SCRF","maxLat":49.26398},{"rooms_shortname":"SCRF","maxLat":49.26398},{"rooms_shortname":"SCRF","maxLat":49.26398},{"rooms_shortname":"SCRF","maxLat":49.26398},{"rooms_shortname":"SCRF","maxLat":49.26398},{"rooms_shortname":"SCRF","maxLat":49.26398},{"rooms_shortname":"SCRF","maxLat":49.26398},{"rooms_shortname":"SCRF","maxLat":49.26398},{"rooms_shortname":"SCRF","maxLat":49.26398},{"rooms_shortname":"SCRF","maxLat":49.26398},{"rooms_shortname":"SCRF","maxLat":49.26398},{"rooms_shortname":"SCRF","maxLat":49.26398},{"rooms_shortname":"SCRF","maxLat":49.26398},{"rooms_shortname":"SCRF","maxLat":49.26398},{"rooms_shortname":"SCRF","maxLat":49.26398},{"rooms_shortname":"SCRF","maxLat":49.26398},{"rooms_shortname":"SCRF","maxLat":49.26398},{"rooms_shortname":"PCOH","maxLat":49.264},{"rooms_shortname":"PCOH","maxLat":49.264},{"rooms_shortname":"PCOH","maxLat":49.264},{"rooms_shortname":"PCOH","maxLat":49.264},{"rooms_shortname":"PCOH","maxLat":49.264},{"rooms_shortname":"PCOH","maxLat":49.264},{"rooms_shortname":"PCOH","maxLat":49.264},{"rooms_shortname":"PCOH","maxLat":49.264},{"rooms_shortname":"FNH","maxLat":49.26414},{"rooms_shortname":"FNH","maxLat":49.26414},{"rooms_shortname":"FNH","maxLat":49.26414},{"rooms_shortname":"FNH","maxLat":49.26414},{"rooms_shortname":"FNH","maxLat":49.26414},{"rooms_shortname":"FNH","maxLat":49.26414},{"rooms_shortname":"SPPH","maxLat":49.2642},{"rooms_shortname":"SPPH","maxLat":49.2642},{"rooms_shortname":"SPPH","maxLat":49.2642},{"rooms_shortname":"SPPH","maxLat":49.2642},{"rooms_shortname":"SPPH","maxLat":49.2642},{"rooms_shortname":"SPPH","maxLat":49.2642},{"rooms_shortname":"SOWK","maxLat":49.2643},{"rooms_shortname":"SOWK","maxLat":49.2643},{"rooms_shortname":"SOWK","maxLat":49.2643},{"rooms_shortname":"SOWK","maxLat":49.2643},{"rooms_shortname":"SOWK","maxLat":49.2643},{"rooms_shortname":"SOWK","maxLat":49.2643},{"rooms_shortname":"SOWK","maxLat":49.2643},{"rooms_shortname":"WOOD","maxLat":49.26478},{"rooms_shortname":"WOOD","maxLat":49.26478},{"rooms_shortname":"WOOD","maxLat":49.26478},{"rooms_shortname":"WOOD","maxLat":49.26478},{"rooms_shortname":"WOOD","maxLat":49.26478},{"rooms_shortname":"WOOD","maxLat":49.26478},{"rooms_shortname":"WOOD","maxLat":49.26478},{"rooms_shortname":"WOOD","maxLat":49.26478},{"rooms_shortname":"WOOD","maxLat":49.26478},{"rooms_shortname":"WOOD","maxLat":49.26478},{"rooms_shortname":"WOOD","maxLat":49.26478},{"rooms_shortname":"WOOD","maxLat":49.26478},{"rooms_shortname":"WOOD","maxLat":49.26478},{"rooms_shortname":"WOOD","maxLat":49.26478},{"rooms_shortname":"WOOD","maxLat":49.26478},{"rooms_shortname":"WOOD","maxLat":49.26478},{"rooms_shortname":"BIOL","maxLat":49.26479},{"rooms_shortname":"BIOL","maxLat":49.26479},{"rooms_shortname":"BIOL","maxLat":49.26479},{"rooms_shortname":"BIOL","maxLat":49.26479},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"ANGU","maxLat":49.26486},{"rooms_shortname":"WESB","maxLat":49.26517},{"rooms_shortname":"WESB","maxLat":49.26517},{"rooms_shortname":"FRDM","maxLat":49.26541},{"rooms_shortname":"LSK","maxLat":49.26545},{"rooms_shortname":"LSK","maxLat":49.26545},{"rooms_shortname":"LSK","maxLat":49.26545},{"rooms_shortname":"LSK","maxLat":49.26545},{"rooms_shortname":"CHEM","maxLat":49.2659},{"rooms_shortname":"CHEM","maxLat":49.2659},{"rooms_shortname":"CHEM","maxLat":49.2659},{"rooms_shortname":"CHEM","maxLat":49.2659},{"rooms_shortname":"CHEM","maxLat":49.2659},{"rooms_shortname":"CHEM","maxLat":49.2659},{"rooms_shortname":"GEOG","maxLat":49.26605},{"rooms_shortname":"GEOG","maxLat":49.26605},{"rooms_shortname":"GEOG","maxLat":49.26605},{"rooms_shortname":"GEOG","maxLat":49.26605},{"rooms_shortname":"GEOG","maxLat":49.26605},{"rooms_shortname":"GEOG","maxLat":49.26605},{"rooms_shortname":"GEOG","maxLat":49.26605},{"rooms_shortname":"GEOG","maxLat":49.26605},{"rooms_shortname":"MATX","maxLat":49.266089},{"rooms_shortname":"HEBB","maxLat":49.2661},{"rooms_shortname":"HEBB","maxLat":49.2661},{"rooms_shortname":"HEBB","maxLat":49.2661},{"rooms_shortname":"HEBB","maxLat":49.2661},{"rooms_shortname":"HENN","maxLat":49.26627},{"rooms_shortname":"HENN","maxLat":49.26627},{"rooms_shortname":"HENN","maxLat":49.26627},{"rooms_shortname":"HENN","maxLat":49.26627},{"rooms_shortname":"HENN","maxLat":49.26627},{"rooms_shortname":"HENN","maxLat":49.26627},{"rooms_shortname":"MGYM","maxLat":49.2663},{"rooms_shortname":"MGYM","maxLat":49.2663},{"rooms_shortname":"MATH","maxLat":49.266463},{"rooms_shortname":"MATH","maxLat":49.266463},{"rooms_shortname":"MATH","maxLat":49.266463},{"rooms_shortname":"MATH","maxLat":49.266463},{"rooms_shortname":"MATH","maxLat":49.266463},{"rooms_shortname":"MATH","maxLat":49.266463},{"rooms_shortname":"MATH","maxLat":49.266463},{"rooms_shortname":"MATH","maxLat":49.266463},{"rooms_shortname":"AUDX","maxLat":49.2666},{"rooms_shortname":"AUDX","maxLat":49.2666},{"rooms_shortname":"IBLC","maxLat":49.26766},{"rooms_shortname":"IBLC","maxLat":49.26766},{"rooms_shortname":"IBLC","maxLat":49.26766},{"rooms_shortname":"IBLC","maxLat":49.26766},{"rooms_shortname":"IBLC","maxLat":49.26766},{"rooms_shortname":"IBLC","maxLat":49.26766},{"rooms_shortname":"IBLC","maxLat":49.26766},{"rooms_shortname":"IBLC","maxLat":49.26766},{"rooms_shortname":"IBLC","maxLat":49.26766},{"rooms_shortname":"IBLC","maxLat":49.26766},{"rooms_shortname":"IBLC","maxLat":49.26766},{"rooms_shortname":"IBLC","maxLat":49.26766},{"rooms_shortname":"IBLC","maxLat":49.26766},{"rooms_shortname":"IBLC","maxLat":49.26766},{"rooms_shortname":"IBLC","maxLat":49.26766},{"rooms_shortname":"IBLC","maxLat":49.26766},{"rooms_shortname":"IBLC","maxLat":49.26766},{"rooms_shortname":"IBLC","maxLat":49.26766},{"rooms_shortname":"LASR","maxLat":49.26767},{"rooms_shortname":"LASR","maxLat":49.26767},{"rooms_shortname":"LASR","maxLat":49.26767},{"rooms_shortname":"LASR","maxLat":49.26767},{"rooms_shortname":"LASR","maxLat":49.26767},{"rooms_shortname":"LASR","maxLat":49.26767},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"BUCH","maxLat":49.26826},{"rooms_shortname":"SRC","maxLat":49.2683},{"rooms_shortname":"SRC","maxLat":49.2683},{"rooms_shortname":"SRC","maxLat":49.2683},{"rooms_shortname":"BRKX","maxLat":49.26862},{"rooms_shortname":"BRKX","maxLat":49.26862},{"rooms_shortname":"UCLL","maxLat":49.26867},{"rooms_shortname":"UCLL","maxLat":49.26867},{"rooms_shortname":"UCLL","maxLat":49.26867},{"rooms_shortname":"UCLL","maxLat":49.26867},{"rooms_shortname":"ANSO","maxLat":49.26958},{"rooms_shortname":"ANSO","maxLat":49.26958},{"rooms_shortname":"ANSO","maxLat":49.26958},{"rooms_shortname":"ANSO","maxLat":49.26958},{"rooms_shortname":"ALRD","maxLat":49.2699},{"rooms_shortname":"ALRD","maxLat":49.2699},{"rooms_shortname":"ALRD","maxLat":49.2699},{"rooms_shortname":"ALRD","maxLat":49.2699},{"rooms_shortname":"ALRD","maxLat":49.2699},{"rooms_shortname":"IONA","maxLat":49.27106},{"rooms_shortname":"IONA","maxLat":49.27106}]};
    it("apply can have more keys than columns Query", function() {
        return insight.performQuery(ApplyColumnsQuery)
            .then(function (result) {
                //console.log(JSON.stringify(result.body));
                //console.log(JSON.stringify(res));
                expect(result.code).to.deep.equal(200);
                //expect(result.body).to.deep.equal();
            }).catch(function (err) {
                console.log(err);
                //expect(err.code).to.deep.equal(400);
                //expect(err.body).to.deep.equal({error: "COLUMNS keys must match APPLY keys"});
                expect.fail();
            })
    });

    /**
     * invalid APPLY string Query
     */
    const invalidApplyStringQuery = {
        "WHERE": {
            "IS": {
                "rooms_furniture": "*Tables*"
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "rooms_shortname",
                "maxSeats"
            ],
            "ORDER": "maxSeats",
            "FORM": "TABLE"
        },
        "TRANSFORMATIONS": {
            "GROUP": ["rooms_shortname"],
            "APPLY": [{
                "maxSeats": {
                    "MAX": "rooms_seats"
                },
                "maxLats": {
                    "MAX": "rooms_seats"
                }
            }]
        }
    };
    it("invalid APPLY string Query", function() {
        return insight.performQuery(invalidApplyStringQuery)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "APPLYKEY must have exactly one string"});
            })
    });

    /**
     * too many APPLYKEY Query
     */
    const tooManyApplykeyQuery = {
        "WHERE": {
            "IS": {
                "rooms_furniture": "*Tables*"
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "rooms_shortname",
                "maxSeats"
            ],
            "ORDER": "maxSeats",
            "FORM": "TABLE"
        },
        "TRANSFORMATIONS": {
            "GROUP": ["rooms_shortname"],
            "APPLY": [{
                "maxSeats": {
                    "MAX": "rooms_seats",
                    "MIN": "rooms_seats"
                }
            }]
        }
    };
    it("too many APPLYKEY Query", function() {
        return insight.performQuery(tooManyApplykeyQuery)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "APPLYKEY must have exactly one APPLYTOKEN"});
            })
    });

    /**
     * invalid APPLYKEY Query
     */
    const invalidApplykeyQuery = {
        "WHERE": {
            "IS": {
                "rooms_furniture": "*Tables*"
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "rooms_shortname",
                "maxSeats"
            ],
            "ORDER": "maxSeats",
            "FORM": "TABLE"
        },
        "TRANSFORMATIONS": {
            "GROUP": ["rooms_shortname"],
            "APPLY": [{
                "maxSeats": {
                    "lol": "rooms_seats"
                }
            }]
        }
    };
    it("invalid APPLYKEY Query", function() {
        return insight.performQuery(invalidApplykeyQuery)
            .then(function (result) {
                console.log(result.body);
                expect.fail();
            }).catch(function (err) {
                console.log(err.body);
                expect(err.code).to.deep.equal(400);
                expect(err.body).to.deep.equal({error: "lol is not a valid APPLYKEY property"});
            })
    });


    it("remove rooms", function () {
        return insight.removeDataset('rooms')
            .then(function(response) {
                expect(response.code).to.deep.equal(204);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });
    it("remove courses", function () {
        return insight.removeDataset('courses')
            .then(function(response) {
                expect(response.code).to.deep.equal(204);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });
});

