/**
 * Created by John on 2017-01-20.
 */
export default class Course
{
    //The department that offered the course.
    private courses_dept: string;
    //The course number (will be treated as a string (e.g., 499b)).
    private courses_id: string;
    //The average of the course offering.
    private courses_avg: number;
    //The instructor teaching the course offering.
    private courses_instructor: string;
    //The name of the course.
    private courses_title: string;
    //The number of students that passed the course offering.
    private courses_pass: number;
    //The number of students that failed the course offering.
    private courses_fail: number;
    //The number of students that audited the course offering.
    private courses_audit: number;
    //the unique id of a course offering.
    private courses_uuid: string;

    constructor(dept: string, id:string)
    {
        this.courses_dept = dept;
        this.courses_id = id;
    }

    pass(num: number)
    {
        this.courses_pass = num;
    }

    fail(num: number)
    {
        this.courses_fail = num;
    }
    audit(num: number)
    {
        this.courses_audit = num;
    }

    average(num: number)
    {
        this.courses_avg = num;
    }

    instrctor(name: string)
    {
        this.courses_instructor = name;
    }

    title(title: string)
    {
        this.courses_title = title;
    }
}