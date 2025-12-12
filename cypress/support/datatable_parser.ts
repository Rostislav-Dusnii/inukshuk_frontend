import { DataTable } from "@badeball/cypress-cucumber-preprocessor";
// import { Lecturer, Topic } from "@types";


export class DataTableParser {
    // static parseLecturers(dataTable: DataTable): Lecturer[] {
    //     const lecturers: Lecturer[] = dataTable.hashes().map((row, index) => ({
    //         id: Number(row.ID) || index + 1,
    //         user: {
    //             firstName: row.Firstname,
    //             lastName: row.Lastname,
    //             fullname: `${row.Firstname} ${row.Lastname}`,
    //             email: row["E-mail"],
    //             username: "",
    //             role: 'lecturer'
    //         },
    //         expertise: row.Expertise,
    //         courses: []
    //     }));
    //     return lecturers;
    // }

    // static parseTopics(dataTable: DataTable): Topic[] {
    //     const topics: Topic[] = dataTable.hashes().map((row, index) => ({
    //         id: Number(row.id),
    //         // date: new Date(row.date),
    //         date: new Date(),
    //         title: row.title,
    //         description: row.description,
    //         user: {username: row.username},
    //         comments: []
    //     }));
    //     return topics;
    // }
}