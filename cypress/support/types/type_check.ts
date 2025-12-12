import { Lecturer, Schedule } from "@types";

export function isStringRecord(obj: unknown): obj is Record<string, string> {
    if (typeof obj !== "object" || obj === null)
        return false

    if (Array.isArray(obj))
        return false

    if (Object.getOwnPropertySymbols(obj).length > 0)
        return false

    return Object.getOwnPropertyNames(obj)
        .every(prop => typeof (obj as Record<string, unknown>)[prop] === "string")
}

export function isLecturer(data: unknown): data is Lecturer {
    return (
        typeof data === "object" &&
        data !== null &&
        typeof (data as Lecturer).id === "number" &&
        typeof (data as Lecturer).user === "object" &&
        (data as Lecturer).user !== null &&
        typeof (data as Lecturer).expertise === "string" &&
        Array.isArray((data as Lecturer).courses) &&
        (data as Lecturer).courses.every(course => typeof course === "object" && course !== null)
    );
}

export function isArrayOfLecturers(data: unknown): data is Lecturer[] {
    return (
        Array.isArray(data) &&
        data.every(item => isLecturer(item))
    );
}

export function isSchedule(data: any): data is Schedule {
    return (
        typeof data === "object" &&
        data !== null &&
        "course" in data &&
        "start" in data &&
        "end" in data &&
        "lecturer" in data &&
        "students" in data
    );
}

export function isArrayOfSchedules(data: unknown): data is Schedule[] {
    return (
        Array.isArray(data) &&
        data.every(item => isSchedule(item))
    );
}

export function isJqueryHtmlElement(data: unknown): data is JQuery<HTMLElement> {
    return (
        typeof data === "object" &&
        data !== null &&
        "find" in data &&
        typeof (data as JQuery<HTMLElement>).find === "function"
    );
}
