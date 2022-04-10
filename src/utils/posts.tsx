// utils for posts
import { formatDistance, differenceInCalendarDays } from 'date-fns'

type StringOrDate = string | Date

const fixDate = (date: StringOrDate) =>
  typeof date === 'string' ? new Date(date) : date

export const isNewPost = (date: StringOrDate) =>
  differenceInCalendarDays(new Date(), fixDate(date)) < 14

export const formatDate = (date: StringOrDate) => {
  const days = formatDistance(fixDate(date), new Date())
  // capitalize "About" if using about
  const fixedDays = days[0].toUpperCase() + days.slice(1)

  return `${fixedDays} ago`
}

export const postLength = (post: string) => {
  const wordCount = post.replace(/[^\w ]/g, '').split(/\s+/).length

  const readingTimeInMinutes = Math.floor(wordCount / 228) + 1
  return `${readingTimeInMinutes} min`
}
