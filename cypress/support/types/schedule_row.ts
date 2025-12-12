import { DataTable } from "@badeball/cypress-cucumber-preprocessor";
import { Schedule } from "@types";
import { isJqueryHtmlElement, isSchedule, isStringRecord } from "./type_check";

export class ScheduleRow {
    constructor(
        public index: number,
        public course: string,
        public start: Date | null,
        public end: Date | null,
        public lecturer: string,
        public enrolledStudents: number
    ) { }

    static from(arg: Schedule, index: number): ScheduleRow;
    static from(arg: Record<string, string>, index: number): ScheduleRow;
    static from(arg: JQuery<HTMLElement>, index: number): ScheduleRow;
    static from(arg: HTMLElement, index: number): ScheduleRow;


    static from(data: Record<string, string>
        | Schedule
        | JQuery<HTMLElement>
        | HTMLElement
        , index: number): ScheduleRow {
        if (isStringRecord(data)) {
            return new ScheduleRow(
                index,
                data.course,
                data.start ? new Date(data.start) : null,
                data.end ? new Date(data.end) : null,
                data.lecturer,
                parseInt(data.enrolledStudents)
            );
        } else if (isJqueryHtmlElement(data)) {
            const course = data.find("td").eq(0)?.text() ?? "";
            const start = data.find("td").eq(1)?.text() ?? "";
            const end = data.find("td").eq(2)?.text() ?? "";
            const lecturer = data.find("td").eq(3)?.text() ?? "";
            const enrolledStudents = data.find("td").eq(4)?.text() ?? "";
            return new ScheduleRow(
                index,
                course,
                start ? new Date(start) : null,
                end ? new Date(end) : null,
                lecturer,
                parseInt(enrolledStudents)
            );
        } else if (isSchedule(data)) {
            return new ScheduleRow(
                index,
                data.course.name,
                data.start,
                data.end,
                data.lecturer.user.fullname ?? "",
                data.students.length
            );
        } else if (data instanceof HTMLElement) {
            const course = data.querySelector("td:nth-child(1)")?.textContent ?? "";
            const start = data.querySelector("td:nth-child(2)")?.textContent ?? "";
            const end = data.querySelector("td:nth-child(3)")?.textContent ?? "";
            const lecturer = data.querySelector("td:nth-child(4)")?.textContent ?? "";
            const enrolledStudents = data.querySelector("td:nth-child(5)")?.textContent ?? "";
            return new ScheduleRow(
                index,
                course,
                start ? new Date(start) : null,
                end ? new Date(end) : null,
                lecturer,
                parseInt(enrolledStudents)
            );
        }
        throw new Error("Invalid data type provided to ScheduleRow.from");
    }

    static arrayFrom(arg: DataTable): ScheduleRow[];
    static arrayFrom(arg: Schedule[]): ScheduleRow[];

    static arrayFrom(data: DataTable | Schedule[]): ScheduleRow[] {
        if (data instanceof DataTable) {
            return data.hashes().map(ScheduleRow.from);
        } else if (Array.isArray(data)) {
            return (data as Schedule[]).map(ScheduleRow.from);
        }
        throw new Error("Invalid data type provided to ScheduleRow.arrayFrom");
    }
}