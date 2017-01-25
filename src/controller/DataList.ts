import Course from "./Course";
/**
 * Created by John on 2017-01-17.
 */


export default class DataList
{
    private id: string;
    private list:  Array<Course>;
    private size: number;

    constructor()
    {
        this.list = [];
    }

    add(obj: any)
    {
        this.list.push(obj);
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

    getID()
    {
        return this.id;
    }

    getSize()
    {
        return this.size;
    }
}