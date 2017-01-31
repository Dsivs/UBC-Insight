/**
 * Created by John on 2017-01-20.
 */
export default class Course {
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

    constructor(dept: string, id: string, avg: number, instructor: string, title: string, pass: number, fail: number, audit: number, uuid: number) {
        this.courses_dept = dept;
        this.courses_id = id;
        this.courses_avg = avg;
        this.courses_instructor = instructor;
        this.courses_title = title;
        this.courses_pass = pass;
        this.courses_fail = fail;
        this.courses_audit = audit;
        this.courses_uuid = uuid.toString();
    }

    dept(): string {
        return this.courses_dept;
    }

    id(): string {
        return this.courses_id;
    }

    avg(): number {
        return this.courses_avg;
    }

    instructor(): string {
        return this.courses_instructor;
    }

    title(): string {
        return this.courses_title;
    }

    pass(): number {
        return this.courses_pass;
    }

    fail(): number {
        return this.courses_fail;
    }

    audit(): number {
        return this.courses_audit;
    }

    uuid(): string {
        return this.courses_uuid;
    }


}