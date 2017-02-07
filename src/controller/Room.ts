/**
 * Created by Axiaz on 2017-02-06.
 */

export default class Room {
    //Full building name (e.g., "Hugh Dempster Pavilion").
    rooms_fullname: string;
    //Short building name (e.g., "DMP").
    rooms_shortname: string;
    //The room number. Not always a number, so represented as a string.
    rooms_number: string;
    //The room id; should be rooms_shortname+"_"+rooms_number.
    rooms_name: string;
    //The building address. (e.g., "6245 Agronomy Road V6T 1Z4").
    rooms_address: string;
    //The latitude of the building.
    rooms_lat: number;
    //The longitude of the building.
    rooms_lon: number;
    //The number of seats in the room.
    rooms_seats: number;
    //The room type (e.g., "Small Group").
    rooms_type: string;
    //The room type (e.g., "Classroom-Movable Tables & Chairs").
    rooms_furniture: string;
    //The link to full details online
    rooms_href: string;

    constructor(fullname: string, shortname: string, number: string, name: string, address: string, lat: number, lon: number, seats: number, type: string, furniture: string, href: string) {
        this.rooms_fullname = fullname;
        this.rooms_shortname = shortname;
        this.rooms_number = number;
        this.rooms_name = name;
        this.rooms_address = address;
        this.rooms_lat = lat;
        this.rooms_lon = lon;
        this.rooms_seats = seats;
        this.rooms_type = type;
        this.rooms_furniture = furniture;
        this.rooms_href = href;
    }
}