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

        //room query = and
        if (typeOfQuery == 3 && isDistanceCheck)
            listOfRooms = checkDistance(data.result);
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
                listOfRooms = mergeArray(roomDistanceFilter(data.result), array);
            }).fail( function(err){
                alert(err.responseText);
                console.log(err);
            });
        }
        else
            listOfRooms = data.result;


        performSchedule(listOfCourses, listOfRooms);

    }).fail( function(err){
        alert(err.responseText);
        console.log(err);
    });
}


function roomDistanceFilter(array)
{
    var i = 0;

    var array_temp = array.slice();

    $.each(array, function(){

        if (array[i] != null) {
            var distance = getDis(array[i].rooms_lat, array[i].rooms_lon);
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

    var unscheduled = 0;

    for (var course in coursesObj) {
        var sections = coursesObj[course].sections;
        var size = coursesObj[course].size;

        unscheduled += schedule(buildingSchedule, rooms, course, sections, size);
    }


    var courseList = [];

    for (var key in coursesObj) {
        courseList.push({
            "Course Name": key,
            "Sections": coursesObj[key].sections,
            "Size per Section": coursesObj[key].size
        })
    }

    generateTable(courseList, ["Course Name", "Sections", "Size per Section"]);

    var quality = document.getElementById("quality");
    quality.innerHTML = "Total Scheduled: " + (totalSections-unscheduled) +
        "   |   Total Unscheduled: " + unscheduled +
        "   |   Percentage of unscheduled courses: " + unscheduled/totalSections*100+"%";

    //FINAL ROOMS SCHEDULE
    var splitRooms = breakUpArray(buildingSchedule, rooms);

    var roomsSize = toObj(rooms);

    generateTimeTable(splitRooms, roomsSize);
}

function getRoomFromIndex(index) {
    return Math.floor(index/15 );
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

    for (var key in courses)
        sum += courses[key]["sections"];

    return sum;

}

function schedule(schedule, rooms, courseName, sections, size) {
    var unScheduled = 0;

    if (sections > 15) {
        unScheduled = sections - 15;
        sections = 15;
    }

    while (sections > 0) {
        var currentIndex = schedule.length;
        var curRoom = rooms[getRoomFromIndex(currentIndex)];
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

function generateTimeTable(array, sizes)
{
    $("#temp").empty();

    for (var room_name in array)
    {
        var size = sizes[room_name];
        var mwf = [];
        var tt = [];

        if (array.hasOwnProperty(room_name)) {
            var temp = array[room_name];
            mwf = temp.MWF;
            tt = temp.TT;
            singleTable(mwf,tt,room_name, size);
        }
    }
}

function singleTable(mwf, tt, room_name, size)
{
    var time = ["08:00", "08:30", "09:00", "09:30","10:00", "10:30", "11:00",
        "11:30", "12:00", "12:30","01:00", "01:30", "02:00", "02:30", "03:00",
        "03:30", "04:00", "04:30"];
    var header ="<tr><th></th><th>Monday</th><th>Tuesday</th><th>Wednesday</th><th>Thursday</th><th>Friday</th></tr>";

    $("#temp").append("<h2>"+"Schedule for room "+room_name+ " | Seats: " + size + "</h2>");
    var tbl=$("<table/>").attr("id",room_name);
    var value = "#"+room_name;

    $("#temp").append(tbl);
    //5 = 5 days

    var mfwIndex = 0;
    var ttIndex = 0;

    for (var clock = 0; clock < time.length; clock++)
    {
        if (clock == 0) {
            $(value).append(header);
        }

            var tr="<tr>";
            var td1="<td>"+time[clock]+"</td>";

            var td7="</tr>";

            if (clock%2 == 0 || clock%3 == 0) {

                if (clock%6 == 0) {
                    var td2=getContent(mwf[mfwIndex], 2);
                    var td4=getContent(mwf[mfwIndex], 2);
                    var td6=getContent(mwf[mfwIndex], 2);
                    mfwIndex++;
                    var td3 = getContent(tt[ttIndex], 3);
                    var td5 = getContent(tt[ttIndex], 3);
                    ttIndex++;
                    $(value).append(tr + td1 + td2 + td3 + td4 + td5 + td6 + td7);
                } else if (clock%2 == 0) {
                    var td2=getContent(mwf[mfwIndex], 2);
                    var td4=getContent(mwf[mfwIndex], 2);
                    var td6=getContent(mwf[mfwIndex], 2);
                    mfwIndex++;
                    $(value).append(tr + td1 + td2 + td4 + td6 + td7);
                } else {
                    var td3 = getContent(tt[ttIndex], 3);
                    var td5 = getContent(tt[ttIndex], 3);
                    ttIndex++;
                    $(value).append(tr + td1 + td3 + td5 + td7);
                }
            } else
                $(value).append(tr + td1 + td7);
    }
}


function getContent(content, rowspan) {

    if (content == null) {
        if (rowspan == 2)
            return "<td rowspan='2'></td>";
        else
            return "<td rowspan='3'></td>";
    }
    else if (rowspan == 2)
        return "<td rowspan='2'>"+content+"</td>";
    else
        return "<td rowspan='3'>"+content+"</td>";
}

function breakUpArray(buildingSchedule, rooms) {

    var roomsSchedule = {};

    for (var i = 0; i < buildingSchedule.length; i++) {

        var currentIndex = i;


        var curRoom = rooms[getRoomFromIndex(currentIndex)]["rooms_name"];

        room_list.push(curRoom);

        if (roomsSchedule[curRoom] == undefined) {
            roomsSchedule[curRoom] = {
                MWF: [],
                TT: []
            }
        }
        if (currentIndex%15 < 9) {
            roomsSchedule[curRoom].MWF.push(buildingSchedule[i]);
        }
        else {
            roomsSchedule[curRoom].TT.push(buildingSchedule[i]);
        }
    }



    return roomsSchedule;

}

function toObj(rooms) {
    var temp = {};

    for (var i = 0; i < rooms.length; i++) {
        temp[rooms[i].rooms_name] = rooms[i].rooms_seats;
    }

    return temp;
}