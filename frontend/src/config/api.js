const API_URL = process.env.REACT_APP_API_URL;
const SOCKET_URL = process.env.REACT_APP_API_URL;

if (!API_URL) {
  console.warn('REACT_APP_API_URL is not defined');
}

export { API_URL, SOCKET_URL };
