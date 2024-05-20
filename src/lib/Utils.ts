export const getHMSFromSeconds = (s: number) => {
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = s % 60
  return { hours, minutes, seconds }
}

export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

export const getHMSToSeconds = (
  hours: number,
  minutes: number,
  seconds: number,
) => {
  return hours * 3600 + minutes * 60 + seconds
}

export const getHMSStringFromSeconds = (s: number) => {
  const { hours, minutes, seconds } = getHMSFromSeconds(s)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
