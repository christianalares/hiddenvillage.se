import { addMonths, format, getMonth } from 'date-fns'

export const formatDate = (date: string): string => {
  return format(new Date(date), 'MMM y')
}
