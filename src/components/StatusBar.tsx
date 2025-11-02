import { useState, useEffect } from 'react';

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
}

export function StatusBar() {
  const [userTime, setUserTime] = useState('');
  const [bostonTime, setBostonTime] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // Update times every second
  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();

      // User's local time
      const userTimeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      setUserTime(userTimeStr);

      // Boston time (America/New_York)
      const bostonTimeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      setBostonTime(bostonTimeStr);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch Boston weather
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Using wttr.in - a simple, no-API-key weather service
        const response = await fetch('https://wttr.in/Boston?format=j1');
        const data = await response.json();

        const current = data.current_condition[0];
        const temp = Math.round(parseInt(current.temp_F));
        const condition = current.weatherDesc[0].value;

        // Map weather codes to simple icons
        const weatherCode = parseInt(current.weatherCode);
        let icon = '☀️';

        if (weatherCode === 113) icon = '☀️'; // Clear/Sunny
        else if (weatherCode === 116) icon = '⛅'; // Partly cloudy
        else if (weatherCode === 119 || weatherCode === 122) icon = '☁️'; // Cloudy
        else if ([176, 263, 266, 293, 296].includes(weatherCode)) icon = '🌧️'; // Light rain
        else if ([299, 302, 305, 308, 356, 359].includes(weatherCode)) icon = '🌧️'; // Rain
        else if ([179, 227, 230, 323, 326, 329, 332, 335, 338].includes(weatherCode)) icon = '❄️'; // Snow
        else if ([182, 185, 281, 284, 311, 314, 317, 350, 362, 365, 374, 377].includes(weatherCode)) icon = '🌨️'; // Sleet/Mixed
        else if ([200, 386, 389, 392, 395].includes(weatherCode)) icon = '⛈️'; // Thunder
        else if ([143, 248, 260].includes(weatherCode)) icon = '🌫️'; // Fog/Mist

        setWeather({ temp, condition, icon });
      } catch (error) {
        console.error('Failed to fetch weather:', error);
        // Fallback to a simple display
        setWeather({ temp: 0, condition: 'unknown', icon: '🌡️' });
      }
    };

    fetchWeather();
    // Update weather every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-4 font-mono text-sm text-spark-eggshell/70">
      <span>user: {userTime}</span>
      <span>•</span>
      <span>hackbu: {bostonTime}</span>
      <span>•</span>
      <span>
        {weather ? `${weather.icon} ${weather.temp}°F` : '🌡️ --°F'}
      </span>
    </div>
  );
}
