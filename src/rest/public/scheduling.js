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


    //TODO
    var listOfCourses;
    var listOfRooms;

    alert("you want to schedule " + course_dept + "_" + course_num + " in building" + buildingVal + " within "
        + meters +" meters of building " + withinBuilding);
}