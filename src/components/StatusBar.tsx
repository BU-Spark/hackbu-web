import { useState, useEffect } from 'react';

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
}

// Event types to show in the banner countdown (configurable)
const BANNER_EVENT_TYPES = ['tech talk', 'code & tell', 'demo night', 'idea jam', 'workshop', 'speaker', 'hackathon', 'poster session'];

function shouldShowInBanner(title: string): boolean {
  const lower = title.toLowerCase();
  return BANNER_EVENT_TYPES.some((t) => lower.includes(t));
}

interface LiveEvent {
  title: string;
  when: string;
  url?: string;
}

interface StatusBarProps {
  events?: { title: string; when: string }[];
}

export function StatusBar({ events = [] }: StatusBarProps) {
  const [userTime, setUserTime] = useState('');
  const [bostonTime, setBostonTime] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [countdown, setCountdown] = useState('');
  const [countdownUrl, setCountdownUrl] = useState('');
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);

  // Fetch live events from Eventbrite API
  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.events && data.events.length > 0) {
          setLiveEvents(data.events);
        }
      })
      .catch(() => {});
  }, []);

  // Update times and countdown every second
  useEffect(() => {
    const activeEvents = liveEvents.length > 0 ? liveEvents : events;

    const updateTimes = () => {
      const now = new Date();
      const currentYear = now.getFullYear();

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

      // Countdown to next event (filtered by banner types)
      if (activeEvents.length > 0) {
        const upcoming = activeEvents
          .map((e) => {
            const d = new Date(`${e.when}, ${currentYear}`);
            return { ...e, _date: d };
          })
          .filter((e) => !isNaN(e._date.getTime()) && e._date > now && shouldShowInBanner(e.title))
          .sort((a, b) => a._date.getTime() - b._date.getTime());

        if (upcoming.length > 0) {
          const diff = upcoming[0]._date.getTime() - now.getTime();
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          setCountdown(`Next: ${upcoming[0].title} in ${days}d ${hours}h`);
          setCountdownUrl((upcoming[0] as any).url || '');
        } else {
          setCountdown('No upcoming events');
          setCountdownUrl('');
        }
      }
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);

    return () => clearInterval(interval);
  }, [events, liveEvents]);

  // Fetch Boston weather
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Using wttr.in - a simple, no-API-key weather service
        const response = await fetch('https://wttr.in/Boston?format=j1');
        const data = await response.json();

        const current = data.current_condition[0];
        const temp = Math.round(parseInt(current.temp_F, 10));
        const condition = current.weatherDesc[0].value;

        // Map weather codes to simple icons
        const weatherCode = parseInt(current.weatherCode, 10);
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
      {countdown && (
        <>
          <span>•</span>
          {countdownUrl ? (
            <a
              href={countdownUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-spark-chartreuse transition-colors underline underline-offset-2 decoration-spark-teal/30"
            >
              {countdown}
            </a>
          ) : (
            <span>{countdown}</span>
          )}
        </>
      )}
    </div>
  );
}
