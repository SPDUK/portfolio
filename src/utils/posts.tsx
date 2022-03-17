// utils for posts
import { formatDistance, differenceInCalendarDays } from 'date-fns'

const fixedDate = date => (typeof date === 'string' ? new Date(date) : date)

export const isNewPost = date =>
  differenceInCalendarDays(new Date(), fixedDate(date)) < 14

export const formatDate = date => {
  const days = formatDistance(fixedDate(date), new Date())
  // capitalize "About" if using about
  const fixedDays = days[0].toUpperCase() + days.slice(1)

  return `${fixedDays} ago`
}

export const postLength = post => {
  const wordCount = post.replace(/[^\w ]/g, '').split(/\s+/).length

  const readingTimeInMinutes = Math.floor(wordCount / 228) + 1
  return `${readingTimeInMinutes} min`
}
