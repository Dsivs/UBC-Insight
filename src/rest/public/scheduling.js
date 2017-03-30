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

    var course_dept = formData.get("dept");
    var course_num = formData.get("num");

    if (course_dept.trim() != "")
        courseFilters.push({IS: {courses_dept: course_dept}});

    if (course_num.trim() != "")
        courseFilters.push({IS: {courses_id: course_num}});

    if (courseFilters.length > 0) {
        var courseQueryType = formData.get("courseQueryType");
        if (courseQueryType == 1)
            courseQuery.WHERE.AND = courseFilters;
        else
            courseQuery.WHERE.OR = courseFilters;
    }

    var buildingVal = formData.get("building");
    var meters = formData.get("meters");
    var withinBuilding = formData.get("building");

    if (buildingVal.trim() != "")
        roomQuery.WHERE = {IS: {rooms_shortname: buildingVal}};

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