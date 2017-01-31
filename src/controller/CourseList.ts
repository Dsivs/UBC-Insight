/**
 * Created by John on 2017-01-17.
 */


export default class CourseList
{
    private id: string;
    private list:  Array<any>;
    private size: number;

    constructor(str: String)
    {
        this.list = [];
        this.size = 0;
    }

    add(obj: any)
    {
        this.list.push(obj);
        this.size++;
    }

    remove(obj: any)
    {
        this.list.splice(obj);
    }

    removeAll()
    {
        this.list = [];
    }

    setID(id: string)
    {
        this.id = id;
    }

    getID(id: string)
    {
        return this.id;
    }

    getSize()
    {
        return this.size;
    }
}