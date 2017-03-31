/**
 * Created by Axiaz on 2017-03-29.
 */

var building_distance;
var target_lat;
var target_lon;
var room_list = [];

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
                "rooms_lon",
                "rooms_seats"
            ],
            "ORDER": {
                dir: "DOWN",
                keys: ["rooms_seats"]
            },
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
    var listOfCourses;
    var listOfRooms;

    $.ajax({
        url: 'http://localhost:63342/query',
        type: 'POST',
        data: JSON.stringify(courseQuery),
        dataType: 'json',
        crossOrigin: true,
        cache: false,
        contentType: 'application/json'
    }).done( function(data){
        listOfCourses = data.result;
        console.log(listOfCourses);
        generateTable(listOfCourses, courseQuery.OPTIONS.COLUMNS);
    }).fail( function(err){
        alert(err.responseText);
        console.log(err);
    });

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
                        "rooms_name", "rooms_lat", "rooms_lon", "rooms_seats"
                    ],
                    "ORDER": {
                        dir: "DOWN",
                        keys: ["rooms_seats"]
                    },
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
        else
        {
            listOfRooms = data.result;
            console.log("FINAL ROOM DATA");
            console.log(listOfRooms);
        }

        performSchedule(listOfCourses, listOfRooms);

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

function performSchedule(courses, rooms) {
    var numRooms = rooms.length;
    var buildingSchedule = [];

    var coursesObj = processCourses(courses);
    var totalSections = getTotalSections(coursesObj);

    console.log(coursesObj);
    console.log(totalSections);

    var unscheduled = 0;

    for (var course in coursesObj) {
        var sections = coursesObj[course].sections;
        var size = coursesObj[course].size;

        //console.log(course + " " + sections + " " + size);

        unscheduled += schedule(buildingSchedule, rooms, course, sections, size);
    }



    console.log(buildingSchedule);
    console.log(unscheduled);


    //PRINT THIS TO TABLE
    console.log(coursesObj);

    console.log("Schedule Quality:");
    console.log("Total Scheduled: " + (totalSections-unscheduled));
    console.log("Total Unscheduled: " + unscheduled);
    console.log("Percentage of unscheduled courses: " + unscheduled/totalSections);


    //FINAL ROOMS SCHEDULE
    var splitRooms = breakUpArray(buildingSchedule, rooms);


    generateTimeTable(splitRooms);

    console.log(splitRooms[0]);


    console.log(JSON.stringify(splitRooms, null, 4));

}

function getRoomFromIndex(index) {
    return Math.floor(index/15 );
}


function generateTimeTable(array)
{

    console.log("time table");
    for (var room_name in array)
    {
        var mwf = [];
        var tt = [];

        if (array.hasOwnProperty(room_name)) {
            console.log("room_name ==" + room_name);
            var temp = array[room_name];
            console.log(temp.MWF);
            mwf = temp.MWF;
            console.log(temp.TT);
            tt = temp.TT;
            singleTable(mwf,tt,room_name);
        }
    }
}

function processCourses(courses) {

    var coursesObj = {};

    for (var i = 0; i < courses.length; i++) {
        var course = courses[i];
        var name = course["courses_dept"]+course["courses_id"];
        if (coursesObj[name] == undefined) {
            coursesObj[name] = {size: course["maxSize"], sections: 0};
            if (course["courses_year"] == 2014) {
                coursesObj[name].sections = Math.ceil(course["numSections"]/3);
            }
        } else {
            if (coursesObj[name].size < course["maxSize"])
                coursesObj[name].size = course["maxSize"];
            if (course["courses_year"] == 2014) {
                coursesObj[name].sections = Math.ceil(course["numSections"]/3);
            }
        }
    }

    var arrayOfSortedKeys = Object.keys(coursesObj).sort(function (a, b) {
        return coursesObj[b]["size"]-coursesObj[a]["size"];
    })

    var temp = {};

    for (var i = 0; i < arrayOfSortedKeys.length; i++) {
        temp[arrayOfSortedKeys[i]] = coursesObj[arrayOfSortedKeys[i]];
    }

    return temp;
}

function getTotalSections(courses) {
    var sum = 0;

    for (var key in courses) {
        //console.log(key);
        //console.log(courses[key]["sections"]);
        sum += courses[key]["sections"];
    }

    return sum;

}

function schedule(schedule, rooms, courseName, sections, size) {
    var unScheduled = 0;

    if (sections > 15) {
        unScheduled = sections - 15;
        sections = 15;
    }

    while (sections > 0) {
        //console.log(schedule);
        var currentIndex = schedule.length;
        var curRoom = rooms[getRoomFromIndex(currentIndex)];
        //console.log(curRoom["rooms_name"]);
        if (curRoom == undefined) {
            return sections+unScheduled;
        }

        if (size > curRoom["rooms_seats"])
            return sections+unScheduled;

        schedule.push(courseName);
        sections--;
    }

    return sections+unScheduled;
}

function singleTable(mwf, tt, room_name)
{
    var time = ["08:00", "08:30", "09:00", "09:30","10:00", "10:30", "11:00",
        "11:30", "12:00", "12:30","01:00", "01:30", "02:00", "02:30", "03:00",
        "03:30", "04:00", "04:30"];
    var header ="<tr><th></th><th>Monday</th><th>Tuesday</th><th>Wednesday</th><th>Thursday</th><th>Friday</th></tr>";

    console.log("single data:");
    console.log(mwf);

    $("#temp").append("<h2>"+"Schedule for room "+room_name+"</h2>");
    var tbl=$("<table/>").attr("id",room_name);
    var value = "#"+room_name;

    $("#temp").append(tbl);
    //5 = 5 days
    for (var clock = 0; clock < time.length; clock++)
    {
        //console.log("HEREEEEE!");
        if (clock == 0) {
            $(value).append(header);
        }
        console.log(mwf[clock]);
            var tr="<tr>";
            var td1="<td>"+time[clock]+"</td>";
            var td2=getContent(mwf[clock]);
            var td3=getContent(tt[clock]);
            var td4=getContent(mwf[clock]);
            var td5=getContent(tt[clock]);
            var td6=getContent(mwf[clock]);
            var td7="</tr>";
            $(value).append(tr+td1+td2+td3+td4+td5+td6+td7);
    }
}


function getContent(content) {

    if (content == null)
        return "<td></td>";
    else
        return "<td>"+content+"</td>";
}

function breakUpArray(buildingSchedule, rooms) {

    var roomsSchedule = {};

    for (var i = 0; i < buildingSchedule.length; i++) {

        var currentIndex = i;


        var curRoom = rooms[getRoomFromIndex(currentIndex)]["rooms_name"];
        //$("#temp").append("<h2>" + curRoom+ "</h2>");

        room_list.push(curRoom);

        if (roomsSchedule[curRoom] == undefined) {
            roomsSchedule[curRoom] = {
                MWF: [],
                TT: []
            }
        }
        if (currentIndex%15 < 9) {
            roomsSchedule[curRoom].MWF.push(buildingSchedule[i]);
            roomsSchedule[curRoom].MWF.push(buildingSchedule[i]);
        }
        else {
            roomsSchedule[curRoom].TT.push(buildingSchedule[i]);
            roomsSchedule[curRoom].TT.push(buildingSchedule[i]);
            roomsSchedule[curRoom].TT.push(buildingSchedule[i]);
        }
    }



    return roomsSchedule;

}