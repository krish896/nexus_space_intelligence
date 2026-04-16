const API_URL = "/v1";
const AUTH_URL = "/auth";

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

async function fetchWithAuth(url, options = {}) {
  const isRelativeUrl = url.startsWith('/');
  const finalUrl = isRelativeUrl ? `${API_URL}${url}` : url;

  if (!options.headers) {
    options.headers = {};
  }
  
  if (accessToken) {
    options.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  
  options.credentials = "include"; // Important for sending/receiving cookies!

  let response = await fetch(finalUrl, options);

  if (response.status === 401 || response.status === 403) {
    // Attempt silently refresh token
    const refreshResponse = await fetch(`${AUTH_URL}/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      setAccessToken(data.accessToken);

      // Retry original request
      options.headers["Authorization"] = `Bearer ${data.accessToken}`;
      response = await fetch(finalUrl, options);
    } else {
      // Refresh failed, user is logged out (or requires login)
      setAccessToken(null);
      // Optional: dispatch an event to log them out visually in React
      window.dispatchEvent(new Event('auth-failed'));
    }
  }

  return response;
}

export default fetchWithAuth;
