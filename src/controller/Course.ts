/**
 * Created by John on 2017-01-20.
 */

export default class Course {
    //The department that offered the course.
    courses_dept: string;
    //The course number (will be treated as a string (e.g., 499b)).
    courses_id: string;
    //The average of the course offering.
    courses_avg: number;
    //The instructor teaching the course offering.
    courses_instructor: string;
    //The name of the course.
    courses_title: string;
    //The number of students that passed the course offering.
    courses_pass: number;
    //The number of students that failed the course offering.
    courses_fail: number;
    //The number of students that audited the course offering.
    courses_audit: number;
    //the unique id of a course offering.
    courses_uuid: string;
    //the year the course was offered
    courses_year: number;

    static courseKeys = ["courses_dept", "courses_id", "courses_avg", "courses_instructor", "courses_title", "courses_pass", "courses_fail", "courses_audit", "courses_uuid", "courses_year"];

    constructor(dept: string, id: string, avg: number, instructor: string, title: string, pass: number, fail: number, audit: number, uuid: string, year: number) {
        this.courses_dept = dept;
        this.courses_id = id;
        this.courses_avg = avg;
        this.courses_instructor = instructor;
        this.courses_title = title;
        this.courses_pass = pass;
        this.courses_fail = fail;
        this.courses_audit = audit;
        this.courses_uuid = uuid;
        this.courses_year = year;
    }
}