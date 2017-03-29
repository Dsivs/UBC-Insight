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
            "COLUMNS": [

            ],
            "FORM": "TABLE"
        }
    };

    var array = [];
    var columns = query.OPTIONS.COLUMNS;

    var form = document.getElementById("main-form");
    var formData = new FormData(form);

    var dept = formData.get("departToggle");
    if (dept == 1) {
        var deptVal = formData.get("department");
        if (isEmpty(deptVal)) {
            emptyFieldAlert();
            return;
        }
        array.push({"IS": {"courses_dept": deptVal}});
    }

    var instructor = formData.get("profToggle");
    if (instructor == 1) {
        var profVal = formData.get("profName");
        if (isEmpty(profVal)) {
            emptyFieldAlert();
            return;
        }
        array.push({"IS": {"courses_instructor": profVal}});
    }

    var group = formData.get("sectionsToggle");
    if (group == 1) {
        var tf = {
            GROUP: ["courses_dept", "courses_id"],
            APPLY: []
        };

        query.OPTIONS.COLUMNS = grouping;

        //Not done yet
    }
}


function isEmpty(someField) {
    return (someField.trim() == "");
}

function emptyFieldAlert() {
    alert("Please fill out the field");
}
