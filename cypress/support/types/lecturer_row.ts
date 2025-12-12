import { DataTable } from "@badeball/cypress-cucumber-preprocessor";
import { Lecturer } from "@types";
import { isJqueryHtmlElement, isLecturer, isStringRecord } from "./type_check";

export class LecturerRow {
    constructor(
        public firstName: string,
        public lastName: string,
        public email: string,
        public expertise: string
    ) { }

    static from(arg: Lecturer): LecturerRow;
    static from(arg: Record<string, string>): LecturerRow;
    static from(arg: JQuery<HTMLElement>): LecturerRow;

    static from(data: Lecturer | Record<string, string> | JQuery<HTMLElement>): LecturerRow{
        if (isStringRecord(data)) {
            return new LecturerRow(
                data.Firstname,
                data.Lastname,
                data["E-mail"],
                data.Expertise
            );
        } else if (isLecturer(data)) {
            return new LecturerRow(
                data.user.firstName ?? "",
                data.user.lastName ?? "",
                data.user.email ?? "",
                data.expertise
            );
        } else if (isJqueryHtmlElement(data)) {
            const firstName = data.find("td").eq(0)?.text() ?? "";
            const lastName = data.find("td").eq(1)?.text() ?? "";
            const email = data.find("td").eq(2)?.text() ?? "";
            const expertise = data.find("td").eq(3)?.text() ?? "";
            return new LecturerRow(firstName, lastName, email, expertise);
        } 
        throw new Error("Invalid data type provided to LecturerRow.from");
    }

    static arrayFrom(arg: DataTable): LecturerRow[];
    static arrayFrom(arg: Lecturer[]): LecturerRow[];

    static arrayFrom(data: DataTable | Lecturer[]): LecturerRow[] {
        if (data instanceof DataTable) {
            return data.hashes().map(LecturerRow.from);
        } else if (Array.isArray(data)) {
            return data.map(LecturerRow.from);
        }
        throw new Error("Invalid data type provided to LecturerRow.arrayFrom");
    }
}
