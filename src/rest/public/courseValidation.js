/**
 * Created by Axiaz on 2017-03-27.
 */

function sure() {
    var r = confirm('Are you ready to submit?');
    if (r == true) {
        doStuff();
    } else {
        alert('cancel');
    }
}

function doStuff() {

    var details = [
        "courses_dept",
        "courses_id",
        "courses_section",
        "courses_avg",
        "courses_instructor",
        "courses_title",
        "courses_pass",
        "courses_fail",
        "courses_audit",
        "courses_uuid",
        "courses_year"
    ];

    var grouping = [
        "courses_dept",
        "courses_id"
    ];

    var query = {
        "WHERE": {
        },
        "OPTIONS": {
            "COLUMNS": details,
            "FORM": "TABLE"
        }
    };

    var filter = [];
    var columns = query.OPTIONS.COLUMNS;

    var form = document.getElementById("main-form");
    var formData = new FormData(form);

    var dept = formData.get("deptToggle");
    if (dept == 1) {
        var deptVal = formData.get("department");
        if (isEmpty(deptVal)) {
            emptyFieldAlert();
            return;
        }
        filter.push({"IS": {"courses_dept": deptVal}});
    }

    var instructor = formData.get("profToggle");
    if (instructor == 1) {
        var profVal = formData.get("profName");
        if (isEmpty(profVal)) {
            emptyFieldAlert();
            return;
        }
        filter.push({"IS": {"courses_instructor": profVal}});
    }

    var group = formData.get("sectionsToggle");
    if (group == 1) {
        var tf = {
            GROUP: ["courses_dept", "courses_id"],
            APPLY: []
        };

        //size filter
        var size = formData.get("sizeToggle");
        if (size == 1) {
            var compType = formData.get("compType");
            var sizeVal = formData.get("size");

            if (isEmpty(sizeVal)) {
                emptyFieldAlert();
                return;
            }

            if (sizeVal.match("[^0-9]") != null) {
                alert('Size must be a non-negative integer');
                return;
            }

            sizeVal = parseInt(sizeVal);

            switch (compType) {
                case "1":
                    filter.push({"GT": {"courses_size": sizeVal}});
                    break;
                case "2":
                    filter.push({"EQ": {"courses_size": sizeVal}});
                    break;
                case "3":
                    filter.push({"LT": {"courses_size": sizeVal}})
            }
        }

        //title filter
        var title = formData.get("titleToggle");
        if (title == 1) {
            var titleVal = formData.get("title");
            if (isEmpty(profVal)) {
                emptyFieldAlert();
                return;
            }
            filter.push({"IS": {"courses_title": titleVal}});
        }


        var sort = {
            dir: "UP",
            keys: []
        };
        var orderKeys = [];
        var mostFail = formData.get("byFail");
        if (mostFail == 1) {
            tf.APPLY.push({
                "totalFail": {
                    "SUM": "courses_fail"
                }
            });
            grouping.push("totalFail");
            orderKeys.push("totalFail");
        }

        var mostPass = formData.get("byPass");
        if (mostPass == 1) {
            tf.APPLY.push({
                "totalPass": {
                    "SUM": "courses_pass"
                }
            });
            grouping.push("totalPass");
            orderKeys.push("totalPass");
        }

        var avgGrade = formData.get("byGrade");
        if (avgGrade == 1) {
            tf.APPLY.push({
                "avgGrade": {
                    "AVG": "courses_avg"
                }
            });
            grouping.push("avgGrade");
            orderKeys.push("avgGrade");
        }


        var sortOrder = formData.get("sortOrder");
        if (sortOrder == 2) {
            sort.dir = "DOWN";
        }

        sort.keys = orderKeys;


        query.OPTIONS.COLUMNS = grouping;

        if (orderKeys.length > 0)
            query.OPTIONS.ORDER = sort;


        query.TRANSFORMATIONS = tf;

    }

    if (filter.length > 0) {
        var typeOfQuery = formData.get("queryType");
        if (typeOfQuery == 1)
            query.WHERE.AND = filter;
        else
            query.WHERE.OR = filter;
    }


    console.log("DONE");

    console.log(JSON.stringify(query, null, 4));
}


function isEmpty(someField) {
    return (someField.trim() == "");
}

function emptyFieldAlert() {
    alert("Please fill out the field");
}
