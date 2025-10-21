import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api/",
  timeout: 10000, // 10s
});

export const sendQuery = async (message) => {
  try {
    const res = await API.post("/ask", { message });
    // treat non-2xx as errors
    if (!res || res.status < 200 || res.status >= 300) {
      const err = new Error(`Request failed with status ${res?.status}`);
      err.status = res?.status;
      err.data = res?.data;
      throw err;
    }
    return res.data;
  } catch (error) {
    // Normalize Axios errors and rethrow a friendly Error
    if (error.response) {
      // Server responded with a status outside 2xx
      const e = new Error(error.response.data?.error || `Server error: ${error.response.status}`);
      e.status = error.response.status;
      e.payload = error.response.data;
      throw e;
    } else if (error.request) {
      // Request was made but no response
      const e = new Error('No response from server — network error or server is down');
      e.code = 'NO_RESPONSE';
      throw e;
    } else {
      // Something else happened
      const e = new Error(error.message || 'Unexpected error');
      throw e;
    }
  }
};
