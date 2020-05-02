// utils for posts
import { formatDistance, differenceInCalendarDays } from 'date-fns'

export const isNewPost = date => {
  const fixedDate = typeof date === 'string' ? new Date(date) : date

  return differenceInCalendarDays(new Date(), fixedDate) < 14
}

export const formatDate = date => formatDistance(date, new Date())
//= > "3 days ago"
