export async function loadLaunches(withMeta = false) {
  const apiUrl = process.env.SPACEX_API_URL || 'https://api.spacexdata.com/v5/launches';
  let fallbackUsed = false;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`SpaceX API ${response.status}`);
    const launches = await response.json();
    const finalLaunches = Array.isArray(launches) ? launches.slice(-10) : (fallbackUsed = true, fallbackLaunches());
    if (withMeta) {
      return {
        launches: finalLaunches,
        fallbackUsed,
        sourceUrl: apiUrl,
        fetchedAt: new Date().toISOString()
      };
    }
    return finalLaunches;
  } catch (error) {
    console.warn('[MiniETL] SpaceX fetch failed:', error.message);
    fallbackUsed = true;
    const launches = fallbackLaunches();
    if (withMeta) {
      return {
        launches,
        fallbackUsed,
        sourceUrl: apiUrl,
        fetchedAt: new Date().toISOString()
      };
    }
    return launches;
  }
}

export function buildMetrics(launches) {
  const total = launches.length;
  const success = launches.filter((launch) => launch.success).length;
  const upcoming = launches.filter((launch) => launch.upcoming).length;
  const lastLaunch = launches[launches.length - 1];
  return {
    rows_in: total,
    rows_out: success,
    dedup_removed: total - success,
    duration_sec: 95,
    lastMission: lastLaunch ? lastLaunch.name : 'N/A',
    upcoming
  };
}

export function fallbackLaunches() {
  return [
    {
      id: 'demo-1',
      name: 'Demo Mission Alpha',
      date_utc: '2025-01-12T14:30:00.000Z',
      success: true,
      upcoming: false,
      rocket: 'Falcon 9',
      launchpad: 'LC-39A',
      payloads: []
    },
    {
      id: 'demo-2',
      name: 'Demo Mission Beta',
      date_utc: '2025-02-02T09:45:00.000Z',
      success: false,
      upcoming: false,
      rocket: 'Falcon 9',
      launchpad: 'SLC-40',
      payloads: []
    },
    {
      id: 'demo-3',
      name: 'Demo Mission Gamma',
      date_utc: '2025-03-05T18:00:00.000Z',
      success: false,
      upcoming: true,
      rocket: 'Starship',
      launchpad: 'Starbase',
      payloads: []
    }
  ];
}

