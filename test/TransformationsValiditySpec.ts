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
                    "max_Lat": {
                        "MAX": "rooms_lat"
                    }
                }]
        }
    };
    it("apply can have more keys than columns Query", function() {
        return insight.performQuery(ApplyColumnsQuery)
            .then(function (result) {
                console.log(result.body);
                expect(result.code).to.deep.equal(200);
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

