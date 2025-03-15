export function getTimestampWithTZ() {
    const timestamp = new Date();
    return timestamp;
}

export function validEventDate(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);

    return dateToCheck >= today;
}
