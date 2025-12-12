import { DataTable } from "@badeball/cypress-cucumber-preprocessor";
import { isJqueryHtmlElement, isStringRecord } from "./type_check";

export class ScheduleStudentRow {
    constructor(
        public index: number,
        public firstname: string,
        public lastname: string,
        public studentnumber: string,
        public enrolled: boolean,
    ) { }

    static from(arg: Record<string, string>, index: number,): ScheduleStudentRow;
    static from(arg: JQuery<HTMLElement>, index: number,): ScheduleStudentRow;
    static from(arg: HTMLElement, index: number,): ScheduleStudentRow;


    static from(data: Record<string, string>
        | JQuery<HTMLElement>
        | HTMLElement,
        index: number,
    ): ScheduleStudentRow {
        if (isStringRecord(data)) {
            return new ScheduleStudentRow(
                index,
                data.Firstname,
                data.Lastname,
                data["Studentnumber"],
                data.Enrolled === "true" ? true : false
            );
        } else if (isJqueryHtmlElement(data)) {
            const firstname = data.find("td").eq(0)?.text() ?? "";
            const lastname = data.find("td").eq(1)?.text() ?? "";
            const studentnumber = data.find("td").eq(2)?.text() ?? "";
            const enrolled = data.find("td").eq(3).find("button")
                .filter((_, btn) => Cypress.$(btn).text().trim() === "Enroll").length == 0;
            return new ScheduleStudentRow(
                index,
                firstname,
                lastname,
                studentnumber,
                enrolled
            );
        } else {
            const firstname = data.querySelector("td:nth-child(1)")?.textContent ?? "";
            const lastname = data.querySelector("td:nth-child(2)")?.textContent ?? "";
            const studentnumber = data.querySelector("td:nth-child(3)")?.textContent ?? "";
            const enrolled = !(data.querySelector("td:nth-child(4)")?.querySelector("button")
                ?.textContent?.trim() === "Enroll");
            return new ScheduleStudentRow(
                index,
                firstname,
                lastname,
                studentnumber,
                enrolled
            );
        }
    }

    static arrayFrom(arg: DataTable): ScheduleStudentRow[];

    static arrayFrom(data: DataTable): ScheduleStudentRow[] {
        if (data instanceof DataTable) {
            return data.hashes().map(ScheduleStudentRow.from);
        }
        throw new Error("Invalid data type provided to ScheduleStudentRow.arrayFrom");
    }

    toString(): string {
        return `Firstname: ${this.firstname}, Lastname: ${this.lastname}, Studentnumber: ${this.studentnumber}, Enrolled: ${this.enrolled}`;
    }
}