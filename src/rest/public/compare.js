/**
 * Created by Axiaz on 2017-03-30.
 */

function sendQuery() {
    var baseQuery = {
        "WHERE": {
            AND: []
        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "courses_id",
                "totalSize",
                "APlus", "A", "AMinus",
                "BPlus", "B", "BMinus",
                "CPlus", "C", "CMinus", "D", "F"
            ],
            "FORM": "TABLE"
        },
        "TRANSFORMATIONS": {
            GROUP: ["courses_dept", "courses_id"],
            APPLY: [
                {
                    totalSize: {
                        "SUM": "courses_size"
                    }
                },
                {
                    APlus: {
                        "SUM": "courses_APlus"
                    }
                },
                {
                    A: {
                        "SUM": "courses_A"
                    }
                },
                {
                    AMinus: {
                        "SUM": "courses_AMinus"
                    }
                },
                {
                    BPlus: {
                        "SUM": "courses_BPlus"
                    }
                },
                {
                    B: {
                        "SUM": "courses_B"
                    }
                },
                {
                    BMinus: {
                        "SUM": "courses_BMinus"
                    }
                },
                {
                    CPlus: {
                        "SUM": "courses_CPlus"
                    }
                },
                {
                    C: {
                        "SUM": "courses_C"
                    }
                },
                {
                    CMinus: {
                        "SUM": "courses_CMinus"
                    }
                },
                {
                    D: {
                        "SUM": "courses_D"
                    }
                },
                {
                    F: {
                        "SUM": "courses_F"
                    }
                }
            ]
        }
    };


    var form = document.getElementById("main-form");
    var formData = new FormData(form);

    var query1 = JSON.parse(JSON.stringify(baseQuery));

    var dept = formData.get("dept");
    if (isEmpty(dept)) {
        emptyFieldAlert();
        return;
    }
    query1.WHERE.AND.push({
        IS: {"courses_dept": dept}
    });

    var name = formData.get("num");
    if (isEmpty(name)) {
        emptyFieldAlert();
        return;
    }

    query1.WHERE.AND.push({
        IS: {"courses_id": name}
    });

    var compType = formData.get("compType");

    if (compType == 2) {
        var prof1 = formData.get("profName1");
        if (isEmpty(prof1)) {
            emptyFieldAlert();
            return;
        }

        var prof2 = formData.get("profName2");
        if (isEmpty(prof2)) {
            emptyFieldAlert();
            return;
        }

        var query2 = JSON.parse(JSON.stringify(query1));
        query2.WHERE.AND.push({
            IS: {"courses_instructor": prof1}
        });

        var query3 = JSON.parse(JSON.stringify(query1));
        query3.WHERE.AND.push({
            IS: {"courses_instructor": prof2}
        });

        //console.log(JSON.stringify(query2, null ,4));
        //console.log(JSON.stringify(query3, null ,4));

        //send query2 and query3
        $.ajax({
            url: 'http://localhost:63342/query',
            type: 'POST',
            data: JSON.stringify(query2),
            dataType: 'json',
            crossOrigin: true,
            cache: false,
            contentType: 'application/json'
        }).done( function(data){
            //console.log("FINAL: Multiple Requests Result:");
            //console.log("query2:");
            //console.log(data.result);

            if (data.result.length == 0) {
                alert("No results Found For First Instructor");
                return;
            }


            data.result[0].instructor = prof1;

            var data1 = data.result;

            $.ajax({
                url: 'http://localhost:63342/query',
                type: 'POST',
                data: JSON.stringify(query3),
                dataType: 'json',
                crossOrigin: true,
                cache: false,
                contentType: 'application/json'
            }).done( function(data){
                //console.log("query3:");
                if (data.result.length == 0) {
                    alert("No results Found For Second Instructor");
                    return;
                }
                data.result[0].instructor = prof2;
                //console.log(data.result);
                compare(data1, data.result);
            }).fail( function(err){
                alert(err.responseText);
                console.log(err);
            });

        }).fail( function(err){
            alert(err.responseText);
            console.log(err);
        });
    }
    else if (compType == 3) {
        var dept2 = formData.get("dept2");
        if (isEmpty(dept2)) {
            emptyFieldAlert();
            return;
        }

        var name2 = formData.get("num2");
        if (isEmpty(name2)) {
            emptyFieldAlert();
            return;
        }

        var query4 = JSON.parse(JSON.stringify(baseQuery));
        query4.WHERE.AND.push({
            IS: {"courses_dept": dept2}
        });

        query4.WHERE.AND.push({
            IS: {"courses_id": name2}
        });

        //send query1 and query4
        //console.log(JSON.stringify(query1, null, 4));
        //console.log(JSON.stringify(query4, null, 4));
        $.ajax({
            url: 'http://localhost:63342/query',
            type: 'POST',
            data: JSON.stringify(query1),
            dataType: 'json',
            crossOrigin: true,
            cache: false,
            contentType: 'application/json'
        }).done( function(data){
            //console.log("FINAL: Multiple Requests Result:");
            //console.log("query1:");
            //console.log(data.result);
            if (data.result.length == 0) {
                alert("No results Found For First Course");
                return;
            }

            var data1 = data.result;

            $.ajax({
                url: 'http://localhost:63342/query',
                type: 'POST',
                data: JSON.stringify(query4),
                dataType: 'json',
                crossOrigin: true,
                cache: false,
                contentType: 'application/json'
            }).done( function(data){
                //console.log("query4:");
                if (data.result.length == 0) {
                    alert("No results Found For Second Course");
                    return;
                }
                compare(data1, data.result);
            }).fail( function(err){
                alert(err.responseText);
                console.log(err);
            });

        }).fail( function(err){
            alert(err.responseText);
            console.log(err);
        });

    }
    else {
        //send 1 request only with query1
        //console.log("HI");
        //console.log(JSON.stringify(query1, null, 4));


        $.ajax({
            url: 'http://localhost:63342/query',
            type: 'POST',
            data: JSON.stringify(query1),
            dataType: 'json',
            crossOrigin: true,
            cache: false,
            contentType: 'application/json'
        }).done( function(data){
            //console.log("FINAL: Single Request Result:");
            //console.log(data.result);
            if (data.result.length == 0) {
                alert("No results Found For Course");
                return;
            }
            compare(data.result);
        }).fail( function(err){
            alert(err.responseText);
            console.log(err);
        });

    }

}


function compare(data1, data2)
{
    google.charts.load('current', {packages: ['corechart', 'bar']});

    if (data2 == undefined) {
        google.charts.setOnLoadCallback(function() {
            drawColColors(data1);
        });
    } else {
        google.charts.setOnLoadCallback(function() {
            drawColColors(data1, data2);
        });
    }

}


function drawColColors(data1, data2) {

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Grades');

    //this defines string in pop up window for bar

    if (data2 != undefined) {
        if (data2[0].instructor != undefined) {
            data.addColumn("number", data1[0].instructor);
            data.addColumn("number", data2[0].instructor);
        } else {
            data.addColumn("number", data1[0].courses_dept + " " + data1[0].courses_id);
            data.addColumn("number", data2[0].courses_dept + " " + data2[0].courses_id);
        }
    } else {
        data.addColumn("number", data1[0].courses_dept + " " + data1[0].courses_id);
    }


    //for bar2
    //data.addColumn('number', 'Energy Level');

    if (data2 == undefined) {
        var size1 = data1[0].totalSize;

        data.addRows([
            //some little notes about this:
            //[{v: [x-axis position, x-position decimal, keep 0], f: 'x-axis label'}, bar1 point, bar2 point],
            ["F (0-49)",    data1[0].F/size1*100],
            ["D (50-54)",   data1[0].D/size1*100],
            ['C- (55-59)',  data1[0].CMinus/size1*100],
            ['C (60-63)',   data1[0].C/size1*100],
            ['C+ (64-67)',  data1[0].CPlus/size1*100],
            ['B- (68-71)',  data1[0].BMinus/size1*100],
            ['B (72-75)',   data1[0].B/size1*100],
            ['B+ (76-79)',  data1[0].BPlus/size1*100],
            ['A- (80-84)',  data1[0].AMinus/size1*100],
            ['A (85-89)',   data1[0].A/size1*100],
            ['A+ (90-100)', data1[0].APlus/size1*100]
        ]);
    } else {
        var size1 = data1[0].totalSize;
        var size2 = data2[0].totalSize;
        data.addRows([
            ["F (0-49)",    data1[0].F/size1*100,      data2[0].F/size2*100],
            ["D (50-54)",   data1[0].D/size1*100,      data2[0].D/size2*100],
            ['C- (55-59)',  data1[0].CMinus/size1*100, data2[0].CMinus/size2*100],
            ['C (60-63)',   data1[0].C/size1*100,      data2[0].C/size2*100],
            ['C+ (64-67)',  data1[0].CPlus/size1*100,  data2[0].CPlus/size2*100],
            ['B- (68-71)',  data1[0].BMinus/size1*100, data2[0].BMinus/size2*100],
            ['B (72-75)',   data1[0].B/size1*100,      data2[0].B/size2*100],
            ['B+ (76-79)',  data1[0].BPlus/size1*100,  data2[0].BPlus/size2*100],
            ['A- (80-84)',  data1[0].AMinus/size1*100, data2[0].AMinus/size2*100],
            ['A (85-89)',   data1[0].A/size1*100,      data2[0].A/size2*100],
            ['A+ (90-100)', data1[0].APlus/size1*100,  data2[0].APlus/size2*100]
        ]);
    }

    //bar graph value


    var options = {
        title: 'Grade Distribution',
        colors: ['#143B5E', '#BF2C2C'],
        hAxis: {
            title: 'Grades'
        },
        vAxis: {
            title: 'Percentage of People'
        }
    };




    $("#placeholder").append("<div id='chart_div' style='height: 25em;'></div>");
    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
    chart.draw(data, options);
    window.location = "#placeholder";
}

function isEmpty(someField) {
    return (someField.trim() == "");
}

function emptyFieldAlert() {
    alert("Please fill out the field");
}