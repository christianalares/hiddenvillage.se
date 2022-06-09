import { addMonths, format, getMonth } from 'date-fns'

const formatDate = (date: Date): string => {
  return format(date, 'MMM y')
  // const month = getMonth(date)

  // if (month === 0) {
  //   return format(date, 'y')
  // } else if (month === 11) {
  //   format(addMonths(date, 1), 'MMM y')
  // }
  // return format(date, 'MMM y')
}

export default formatDate
