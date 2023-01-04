import { format } from 'date-fns';

export const filters = {
  dateTime(input: number | Date): string {
    return format(input, 'd/MM/yyyy, H:mm');
  },
  percent(input: number): string {
    return `${Math.round(input)}%`;
  }
};
