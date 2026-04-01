// Utility functions for your app

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export const cn = (...classes: (string | false | undefined)[]): string => {
  return classes.filter(Boolean).join(' ')
}
