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
    console.log(compType);

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

        console.log(JSON.stringify(query2, null ,4));
        console.log(JSON.stringify(query3, null ,4));

        //send query2 and query3
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
        console.log(JSON.stringify(query1, null, 4));
        console.log(JSON.stringify(query4, null, 4));
    }
    else {
        //send 1 request only with query1
        console.log("HI");
        console.log(JSON.stringify(query1, null, 4));
    }

}


function compare()
{
    var query = {
        "WHERE": {
        },
        "OPTIONS": {
            "COLUMNS": details,
            "FORM": "TABLE"
        }
    };

    var filter = [];

    var form = document.getElementById("main-form");
    var formData = new FormData(form);

    alert("sample data graph will be shown");
    google.charts.load('current', {packages: ['corechart', 'bar']});
    google.charts.setOnLoadCallback(drawColColors);
}


function drawColColors() {
    var data = new google.visualization.DataTable();
    data.addColumn('timeofday', 'Time of Day');
    //this defines string in pop up window for bar1
    data.addColumn('number', 'Motivation Level');
    //for bar2
    data.addColumn('number', 'Energy Level');

    //bar graph value
    data.addRows([

        //some little notes about this:
        //[{v: [x-axis position, x-position decimal, keep 0], f: 'x-axis label'}, bar1 point, bar2 point],
        [{v: [8, 0, 0], f: '8 am'}, 1, .25],
        [{v: [9, 0, 0], f: '9 am'}, 2, .5],
        [{v: [10, 0, 0], f:'10 am'}, 3, 1],
        [{v: [11, 0, 0], f: '11 am'}, 4, 2.25],
        [{v: [12, 0, 0], f: '12 pm'}, 5, 2.25],
        [{v: [13, 0, 0], f: '1 pm'}, 6, 3],
        [{v: [14, 0, 0], f: '2 pm'}, 7, 4],
        [{v: [15, 0, 0], f: '3 pm'}, 8, 5.25],
        [{v: [16, 0, 0], f: '4 pm'}, 9, 7.5],
        [{v: [17, 0, 0], f: '5 pm'}, 9.8, 9.2]
    ]);

    var options = {
        title: 'Motivation and Energy Level Throughout the Day',
        colors: ['#143B5E', '#BF2C2C'],
        hAxis: {
            title: 'Time of Day',
            //format needs to be changed
            format: 'h:mm a',
            viewWindow: {
                //min: [starting x-axis position, x-position decimal point , 0],
                min: [7, 30, 0],
                max: [17, 30, 0]
            }
        },
        vAxis: {
            title: 'Rating (scale of 1-10)'
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