export const filters = {
  dateTime(input: number | Date): string {
    const date = new Date(input);
    const datePart = `${padNumber(date.getDate())}/${padNumber(date.getMonth() + 1)}/${date.getFullYear()}`;
    const timePart = `${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`;
    return `${datePart} ${timePart}`;
  },
  percent(input: number): string {
    return `${Math.round(input)}%`;
  }
};

function padNumber(value: number): string {
  return value.toString().padStart(2, '0');
}
