/**
 * Created by Axiaz on 2017-03-29.
 */

var building_distance;
var target_lat;
var target_lon;

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


    var building = formData.get("buildingToggle");

    if (building == 1) {
        var buildingVal = formData.get("building");

        if (isEmpty(buildingVal)) {
            emptyFieldAlert();
            return;
        }
        roomQuery.WHERE = {IS: {rooms_shortname: buildingVal}};
    }

    var isDistanceCheck = false;
    var dis = formData.get("distanceToggle");
    if (dis == 1) {

        building_distance = formData.get("meter");

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
        getTargetDis(building_shortname);
        isDistanceCheck = true;
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
    $.ajax({
        url: 'http://localhost:63342/query',
        type: 'POST',
        data: JSON.stringify(roomQuery),
        dataType: 'json',
        crossOrigin: true,
        cache: false,
        contentType: 'application/json'
    }).done( function(data){

        var array = data.result;
        var typeOfQuery = formData.get("roomQueryType");

        console.log("query room type = " + typeOfQuery);
        //room query = and
        if (typeOfQuery == 3 && isDistanceCheck)
        {
            //FINAL room query for AND
            listOfRooms = checkDistance(data.result);
            console.log("FINAL room query for AND:");
            console.log(listOfRooms);
        }
        else if (typeOfQuery == 4 && isDistanceCheck)
        {
            //query type = OR
            var query = {
                "WHERE": {
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_fullname", "rooms_shortname", "rooms_number", "rooms_name", "rooms_address", "rooms_lat", "rooms_lon", "rooms_seats", "rooms_type", "rooms_furniture", "rooms_href"
                    ],
                    "FORM": "TABLE"
                }
            };
            $.ajax({
                url: 'http://localhost:63342/query',
                type: 'POST',
                data: JSON.stringify(query),
                dataType: 'json',
                crossOrigin: true,
                cache: false,
                contentType: 'application/json'
            }).done( function(data){
                //FINAL room query for OR
                listOfRooms = mergeArray(roomDistanceFilter(data.result), array);
                console.log("FINAL room query for OR");
                console.log(listOfRooms);
            }).fail( function(err){
                alert(err.responseText);
                console.log(err);
            });
        }
    }).fail( function(err){
        alert(err.responseText);
        console.log(err);
    });
}


function roomDistanceFilter(array)
{
    console.log("roomDistanceFilter(array) called");
    var i = 0;

    var array_temp = array.slice();

    $.each(array, function(){

        if (array[i] != null) {
            var distance = getDis(array[i].rooms_lat, array[i].rooms_lon);
            console.log(distance + " > " + building_distance);
            array_temp[i].distance = distance;
        }
        i++;
    });
    i = 0;
    $.each(array, function(){
        if (array[i] != null) {
            if (array_temp[i].distance > building_distance) {
                array_temp.splice(i, 1);
                i--;
            }

            i++;
        }
    });
    return array_temp;
}


function mergeArray(array_all, array_unique)
{
    var i = 0;
    $.each(array_unique, function(){
        if (array_unique[i] != null) {
            array_unique[i].distance = getDis(array_unique[i].rooms_lat, array_unique[i].rooms_lon);
        }
        i++;
    });

    console.log("mergeArray called");
    var merged = array_all.concat(array_unique);


    i = 0;
    //remove duplicate
    $.each(merged, function(){
        var j = i+1;
        $.each(merged, function(){

            if(merged[i] != null && merged[j] != null) {
                if (merged[i].rooms_name == merged[j].rooms_name) {
                    merged.splice(j--, 1);
                }
            }
            j++;
        });
        i++;
    });
    return merged;
}

//For Room AND Query
function checkDistance(array) {
    var i = 0;
    var array_temp = array.slice();
    $.each(array, function(){
        if (array[i] != null) {
            var distance = getDis(array[i].rooms_lat, array[i].rooms_lon);
            console.log(distance + " > " + building_distance);
            array_temp[i].distance = distance;
        }
        i++;
    });
    i = 0;
    $.each(array, function(){

        if (array[i] != null) {
            if (array_temp[i].distance > building_distance) {
                array_temp.splice(i, 1);
                i--;
            }
            i++;
        }
    });
    return array_temp;
}


function getDis(lat1, lon1) {
    // Math.PI / 180
    var p = 0.017453292519943295;
    var cos = Math.cos;
    var res = 0.5 - cos((target_lat - lat1) * p)/2 +
        cos(lat1 * p) * cos(target_lat * p) *
        (1 - cos((target_lon - lon1) * p))/2;
    // 2 * R; R = 6371 km
    return 12742 * Math.asin(Math.sqrt(res)) * 1000;
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


function getTargetDis(shortname)
{
    var query = {
        "WHERE": {
        },
        "OPTIONS": {
            "COLUMNS": [
                "rooms_name"
            ],
            "FORM": "TABLE"
        }
    };

    var array = [];
    var columns = query.OPTIONS.COLUMNS;
    array.push({"IS": {"rooms_shortname": shortname}});
    query.WHERE.AND = array;
    columns.push("rooms_lat");
    columns.push("rooms_lon");

    $.ajax({
        url: 'http://localhost:63342/query',
        type: 'POST',
        data: JSON.stringify(query),
        dataType: 'json',
        crossOrigin: true,
        cache: false,
        contentType: 'application/json'
    }).done( function(data){
        //data will be the result json obj
        console.log('target response: ' + data);
        console.log(data);
        console.log('target building lat = ' + data.result[0].rooms_lat + ", lon = " + data.result[0].rooms_lon);
        target_lat = data.result[0].rooms_lat;
        target_lon= data.result[0].rooms_lon;
    }).fail( function(err){
        alert(err.responseText);
        console.log(err);
    });
}