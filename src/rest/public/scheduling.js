/**
 * Created by Axiaz on 2017-03-29.
 */



function scheduling()
{
    var courseQuery = {
        "WHERE": {
        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "courses_id",
                "courses_year",
                "maxSize",
                "numSections"
            ],
            "FORM": "TABLE"
        },
        "TRANSFORMATIONS": {
            "GROUP": ["courses_dept", "courses_id", "courses_year"],
            "APPLY": [
                {
                    "maxSize": {
                        "MAX": "courses_size"
                    }
                },
                {
                    "numSections": {
                        "COUNT": "courses_section"
                    }
                }
            ]
        }
    };

    var roomQuery = {
        "WHERE": {
        },
        "OPTIONS": {
            "COLUMNS": [
                "rooms_name",
                "rooms_lat",
                "rooms_lon"
            ],
            "FORM": "TABLE"
        }
    };


    var form = document.getElementById("main-form");
    var formData = new FormData(form);


    var courseFilters = [];

    var course_num = formData.get("num");

    var dept = formData.get("deptToggle");
    if (dept == 1) {
        var deptVal = formData.get("dept");
        if (isEmpty(deptVal)) {
            emptyFieldAlert();
            return;
        }

        courseFilters.push({IS: {courses_dept: deptVal}});
    }

    var num = formData.get("nameToggle");
    if (num == 1) {
        var numVal = formData.get("courseName");
        if (isEmpty(numVal)) {
            emptyFieldAlert();
            return;
        }

        courseFilters.push({IS: {courses_id: numVal}});
    }

    if (courseFilters.length > 0) {
        var courseQueryType = formData.get("courseQueryType");
        if (courseQueryType == 1)
            courseQuery.WHERE.AND = courseFilters;
        else
            courseQuery.WHERE.OR = courseFilters;
    }

    var dis = formData.get("distanceToggle");
    if (dis == 1) {

        var building_distance = formData.get("meter");

        if (isEmpty(building_distance)) {
            emptyFieldAlert();
            return;
        }

        if (isNaN(building_distance)) {
            alert("Distance must be a nonnegative number");
            return;
        }

        building_distance = parseFloat(building_distance);

        if (building_distance < 0) {
            alert("Distance must be a nonnegative number");
            return;
        }

        var building_shortname = formData.get("within");

        if (isEmpty(building_shortname)) {
            emptyFieldAlert();
            return;
        }

        //do your distance thingy here
    }

    console.log(JSON.stringify(courseQuery, null, 4));
    console.log(JSON.stringify(roomQuery, null, 4));


    $.ajax({
        url: 'http://localhost:63342/query',
        type: 'POST',
        data: JSON.stringify(courseQuery),
        dataType: 'json',
        crossOrigin: true,
        cache: false,
        contentType: 'application/json'
    }).done( function(data){
        var listOfCourses = data.result;
        console.log(listOfCourses);
        generateTable(listOfCourses, courseQuery.OPTIONS.COLUMNS);
    }).fail( function(err){
        alert(err.responseText);
        console.log(err);
    });

    var listOfRooms;

    alert("you want to schedule " + course_dept + "_" + course_num + " in building" + buildingVal + " within "
        + meters +" meters of building " + withinBuilding);
}


function generateTable(data, columns) {
    var tbl_body = document.createElement("tbody");
    var odd_even = false;
    console.log("DATA", data);

    if (data == null || data.length == 0)
    {
        alert("No Result Found, Please Try Search Something Else");
        document.getElementById("tblResults").innerHTML = '';
        document.getElementById("result").style.display = "none";
    }
    else {
        document.getElementById("result").style.display = "";
        if ($('#tblResults').children().length > 0)
        {
            document.getElementById("tblResults").innerHTML = '';
        }
        $.each(data, function () {
            var tbl_row = tbl_body.insertRow();
            tbl_row.className = odd_even ? "odd" : "even";
            $.each(this, function (k, v) {
                var cell = tbl_row.insertCell();
                cell.appendChild(document.createTextNode(v.toString()));
            });
            odd_even = !odd_even;
        });


        var table = document.getElementById("tblResults");
        var header = table.createTHead();
        var row = header.insertRow(0);
        var i = 0;
        $.each(columns, function () {
            var cell = row.insertCell();
            cell.innerHTML = "<strong>" + columns[i].toString() + "</strong>";
            i++;
        });

        //document.getElementById("tblResults").appendChild(tbl_head);
        document.getElementById("tblResults").appendChild(tbl_body);
        window.location = "#result";
        // $("#tblResults").appendChild(tbl_body);
    }
}

function isEmpty(someField) {
    return (someField.trim() == "");
}

function emptyFieldAlert() {
    alert("Please fill out the field");
}