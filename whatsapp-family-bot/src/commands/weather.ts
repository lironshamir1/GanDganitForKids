interface GeoResult {
  results?: Array<{
    name: string;
    latitude: number;
    longitude: number;
    country_code?: string;
  }>;
}

interface WeatherResult {
  current: {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_probability_max: number[];
  };
}

const WEATHER_CODES: Record<number, string> = {
  0: 'שמיים בהירים ☀️',
  1: 'בעיקר בהיר 🌤️',
  2: 'חלקית מעונן ⛅',
  3: 'מעונן ☁️',
  45: 'ערפל 🌫️',
  48: 'ערפל עם כפור 🌫️',
  51: 'טפטוף קל 🌦️',
  53: 'טפטוף 🌦️',
  55: 'טפטוף חזק 🌧️',
  61: 'גשם קל 🌧️',
  63: 'גשם 🌧️',
  65: 'גשם חזק ⛈️',
  71: 'שלג קל 🌨️',
  73: 'שלג 🌨️',
  75: 'שלג כבד ❄️',
  80: 'ממטרים קלים 🌦️',
  81: 'ממטרים 🌧️',
  82: 'ממטרים חזקים ⛈️',
  95: 'סופת רעמים ⛈️',
  96: 'סופת רעמים עם ברד 🌩️',
  99: 'סופת רעמים חזקה 🌩️',
};

const DEFAULT_CITY = { name: 'תל אביב', lat: 32.0853, lon: 34.7818 };

async function geocode(name: string): Promise<{ name: string; lat: number; lon: number } | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=he&format=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as GeoResult;
  const r = data.results?.[0];
  if (!r) return null;
  return { name: r.name, lat: r.latitude, lon: r.longitude };
}

export async function getWeather(cityArg: string): Promise<string> {
  const query = cityArg.trim();
  let city = DEFAULT_CITY;
  if (query) {
    const found = await geocode(query);
    if (!found) return `🤷 לא מצאתי את "${query}". נסו שם עיר מדויק יותר.`;
    city = { name: found.name, lat: found.lat, lon: found.lon };
  }

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}` +
    `&current=temperature_2m,weather_code,wind_speed_10m` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max` +
    `&timezone=Asia%2FJerusalem&forecast_days=1`;

  const res = await fetch(url);
  if (!res.ok) return '😵 לא הצלחתי לקבל תחזית כרגע.';
  const data = (await res.json()) as WeatherResult;

  const now = data.current;
  const today = {
    min: data.daily.temperature_2m_min[0],
    max: data.daily.temperature_2m_max[0],
    code: data.daily.weather_code[0],
    rain: data.daily.precipitation_probability_max[0],
  };

  const currentDesc = WEATHER_CODES[now.weather_code] ?? '🌡️';
  const dayDesc = WEATHER_CODES[today.code] ?? '';

  return `🌤️ *מזג האוויר ב${city.name}*
עכשיו: ${Math.round(now.temperature_2m)}°C, ${currentDesc}
רוח: ${Math.round(now.wind_speed_10m)} קמ"ש

היום: ${Math.round(today.min)}°-${Math.round(today.max)}°, ${dayDesc}
סיכוי לגשם: ${today.rain}%`;
}
