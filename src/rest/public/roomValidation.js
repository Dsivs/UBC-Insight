/**
 * Created by Axiaz on 2017-03-25.
 */

var building_distance;
var target_lat;
var target_lon;

function sure() {
    var r = confirm('Are you ready to submit?');
    if (r == true) {
        doStuff();
    } else {
        alert('cancel');
    }
}

function doStuff() {

    var isDistance = false;

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

    var array = [];
    var columns = query.OPTIONS.COLUMNS;

    var form = document.getElementById("main-form");
    var formData = new FormData(form);


    //1 = checked
    var room = formData.get("roomToggle");
    if (room == 1) {
        var roomVal = formData.get("room");
        if (isEmpty(roomVal)) {
            emptyFieldAlert();
            return;
        }
        array.push({"IS": {"rooms_number": roomVal}});
    }

    var building = formData.get("buildingToggle");
    if (building == 1) {
        var buildingVal = formData.get("building");
        if (isEmpty(buildingVal)) {
            emptyFieldAlert();
            return;
        }
        array.push({"IS": {"rooms_shortname": buildingVal}});
    }

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
                array.push({"GT": {"rooms_seats": sizeVal}});
                break;
            case "2":
                array.push({"EQ": {"rooms_seats": sizeVal}});
                break;
            case "3":
                array.push({"LT": {"rooms_seats": sizeVal}})
        }
    }

    var roomType = formData.get("roomTypeToggle");
    if (roomType == 1) {
        var roomTypeVal = formData.get("roomtype");
        if (isEmpty(roomTypeVal)) {
            emptyFieldAlert();
            return;
        }


        array.push({"IS": {"rooms_type": roomTypeVal}});
    }

    var furniture = formData.get("furnitureToggle");
    if (furniture == 1) {

        var furnitureVal = formData.get("furniture");

        if (isEmpty(furnitureVal)) {
            emptyFieldAlert();
            return;
        }

        array.push({"IS": {"rooms_furniture": furnitureVal}});
    }


    //1 = AND, 2 = OR
    var typeOfQuery = formData.get("type");
    if (array.length > 0) {
        if (typeOfQuery == 1)
            query.WHERE.AND = array;
        else
            query.WHERE.OR = array;
    }



    var dis = formData.get("distanceToggle");
    if (dis == 1) {
        isDistance = true;
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
    }


    $.ajax({
        url: 'http://localhost:63342/query',
        type: 'POST',
        data: JSON.stringify(query),
        dataType: 'json',
        crossOrigin: true,
        cache: false,
        contentType: 'application/json'
    }).done( function(data){


        console.log("initial data");
        console.log(data.result);
        if(isDistance && target_lat == null)
        {
            alert("Invalid Building Name");
            document.getElementById("tblResults").innerHTML = '';
            document.getElementById("result").style.display = "none";
        }
        else if (isDistance && typeOfQuery == 1)
        {
            console.log("AND distance");
            checkDistance(data.result, columns, building_shortname);
        }
        else if(isDistance && typeOfQuery == 2)
        {
            console.log("OR distance");
            getAllRooms(data.result, columns, building_shortname);
        }
        else
        {
            console.log("else type= " +typeOfQuery);
            generateTable(data.result, columns);
        }
    }).fail( function(err){
        alert(err.responseText);
        console.log(err);
    });
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

function getAllRooms(array, columns, building_shortname)
{
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
        var merged = mergeArray(roomDistanceFilter(data.result), array);
        columns.push("Distance to " + building_shortname);
        generateTable(merged,columns);
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


function isEmpty(someField) {
    return (someField.trim() == "");
}

function emptyFieldAlert() {
    alert("Please fill out the field");
}

function checkDistance(array, columns, building_shortname) {

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

    columns.push("Distance to " + building_shortname);
    generateTable(array_temp, columns);
}


function getDis(lat1, lon1) {
    var lat2 = target_lat;
    var lon2 = target_lon;
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 +
        c(lat1 * p) * c(lat2 * p) *
        (1 - c((lon2 - lon1) * p))/2;

    return 12742 * Math.asin(Math.sqrt(a)) * 1000; // 2 * R; R = 6371 km
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

        if (data != null && data.result[0] != null && data.result[0].rooms_lat!= null) {
            target_lat = data.result[0].rooms_lat;
            target_lon = data.result[0].rooms_lon;
        }
    }).fail( function(err){
        alert(err.responseText);
        console.log(err);
    });


}