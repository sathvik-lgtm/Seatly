export function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateShort(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(`${dateString}T00:00:00`)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTime(timeString) {
  if (!timeString) return 'N/A'
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function formatClass(className) {
  if (!className) return 'N/A'
  return className.charAt(0).toUpperCase() + className.slice(1)
}

export function formatGender(gender) {
  if (!gender) return 'N/A'
  return gender.charAt(0).toUpperCase() + gender.slice(1)
}

export function formatSlugAsTitle(slug) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
