import { addDays, format, differenceInDays, isSameDay, isWithinInterval, addWeeks, addMonths } from 'date-fns';

export const formatDate = (date: Date): string => {
  return format(date, 'MMM dd, yyyy');
};

export const formatShortDate = (date: Date): string => {
  return format(date, 'MMM dd');
};

export const formatLongDate = (date: Date): string => {
  return format(date, 'MMM dd, yyyy');
};

export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  return differenceInDays(endDate, startDate) + 1; // Include both start and end days
};

export const generateDateRange = (
  startDate: Date, 
  endDate: Date, 
  viewMode: 'day' | 'week' | 'month' = 'week'
): Date[] => {
  if (viewMode === 'day') {
    // For day view, show each day
    const days = getDaysBetween(startDate, endDate);
    return Array.from({ length: days }, (_, i) => addDays(startDate, i));
  } else if (viewMode === 'week') {
    // For week view, show the start of each week
    const days = getDaysBetween(startDate, endDate);
    const weeks = Math.ceil(days / 7);
    return Array.from({ length: weeks }, (_, i) => addWeeks(startDate, i));
  } else {
    // For month view, show the start of each month
    const months = differenceInDays(endDate, startDate) / 30;
    return Array.from({ length: Math.ceil(months) }, (_, i) => addMonths(startDate, i));
  }
};

export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return isWithinInterval(date, { start: startDate, end: endDate });
};

export const isSameDate = (date1: Date, date2: Date): boolean => {
  return isSameDay(date1, date2);
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};
