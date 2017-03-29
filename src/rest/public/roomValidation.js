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
        console.log(roomVal);
        array.push({"IS": {"rooms_number": roomVal}});
    }

    var building = formData.get("buildingToggle");
    //console.log(building);
    if (building == 1) {
        var buildingVal = formData.get("building");
        if (isEmpty(buildingVal)) {
            emptyFieldAlert();
            return;
        }
        array.push({"IS": {"rooms_shortname": buildingVal}});
    }

    var size = formData.get("sizeToggle");
    console.log(size);
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
    //console.log(roomType);

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
    if (array.length > 0) {
        var typeOfQuery = formData.get("type");
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

    console.log(JSON.stringify(query, null, 4));

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
        console.log('response: ' + data);

        if (isDistance)
        {
            checkDistance(data.result, columns, building_shortname);
        }
        else
        {
            generateTable(data.result, columns);
        }
    }).fail( function(err){
        alert(err.responseText);
        console.log(err);
    });
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

    //console.log("HERE!!");
    //console.log(array);
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


function getDis_temp(lat,lon) {
    var radius = 6371; // Radius of the earth in km
    var dLat = (lat-target_lat) * (Math.PI/180);
    var dLon = (lon-target_lon) * (Math.PI/180);

    //Haversine formula, source1: https://en.wikipedia.org/wiki/Haversine_formula
    //source2: https://en.wikipedia.org/wiki/Haversine_formula
    var a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos((target_lat)* (Math.PI/180)) * Math.cos((lat)* (Math.PI/180)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    var distance = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return radius * distance * 1000;
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