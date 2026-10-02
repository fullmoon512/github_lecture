export const WEATHER_TYPES = ['sunny', 'cloudy', 'rain'];

// config.weather 의 확률표로 오늘 날씨를 뽑는다. rand 는 0 이상 1 미만
export function rollWeather(weights, rand = Math.random) {
  const total = WEATHER_TYPES.reduce((sum, w) => sum + weights[w], 0);
  let r = rand() * total;
  for (const w of WEATHER_TYPES) {
    r -= weights[w];
    if (r < 0) return w;
  }
  return WEATHER_TYPES[WEATHER_TYPES.length - 1];
}
