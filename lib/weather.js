export async function getWeather(lat, lon, locationName) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=&lon=&appid=&units=imperial`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Weather API error: `)
  const data = await res.json()
  const temp = Math.round(data.main.temp)
  const feels = Math.round(data.main.feels_like)
  const desc = capitalize(data.weather[0].description)
  const humidity = data.main.humidity
  return {
    location: locationName,
    temp,
    feels,
    desc,
    humidity,
    text: `?? : °F (feels °F)\n • % humidity`,
  }
}
export async function geocodeCity(cityName) {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=&limit=1&appid=`
  const res = await fetch(url)
  const data = await res.json()
  if (!data || data.length === 0) throw new Error('City not found')
  return { lat: data[0].lat, lon: data[0].lon, name: `, ` }
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
