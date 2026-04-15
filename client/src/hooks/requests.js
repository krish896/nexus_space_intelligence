import fetchWithAuth from '../services/apiFetch';

async function httpGetPlanets() {
  const response = await fetchWithAuth("/planets");
  if (!response.ok) return [];
  return response.json();
}

async function httpGetLaunches() {
  const response = await fetchWithAuth("/launches");
  if (!response.ok) return [];
  const fetchedLaunches = await response.json();
  return fetchedLaunches.sort((a, b) => {
    return a.flightNumber - b.flightNumber;
  });
}

async function httpSubmitLaunch(launch) {
  try {
    return await fetchWithAuth("/launches", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(launch),
    });
  } catch (err) {
    return { ok: false };
  }
}

async function httpAbortLaunch(id) {
  try {
    return await fetchWithAuth(`/launches/${id}`, {
      method: "delete",
    });
  } catch (err) {
    console.log(err);
    return { ok: false };
  }
}

async function httpGetLaunchDetails(id) {
  try {
    const response = await fetchWithAuth(`/launches/${id}/details`);
    if (!response.ok) return null;
    return response.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

export { httpGetPlanets, httpGetLaunches, httpSubmitLaunch, httpAbortLaunch, httpGetLaunchDetails };
