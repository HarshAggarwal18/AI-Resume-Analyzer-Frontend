import axios from "axios";

// Create axios instance with base configuration
// NOTE: do NOT set Content-Type here for multipart requests — the browser will
// set the proper boundary when FormData is used. Setting it manually can
// cause servers to reject the request.
const api = axios.create({
  // baseURL: "http://localhost:8081/api", // Updated Spring Boot API URL
  baseURL: "https://ai-resume-analyser-7za3.onrender.com/api",
  timeout: 60000, // 60 seconds timeout for file uploads
});

// Add interceptors to log request/response details and timing to help
// diagnose network errors (CORS, connection refused, wrong URL, etc.).
api.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() };
    try {
      console.groupCollapsed(
        "[API] Request ->",
        config.method?.toUpperCase(),
        config.url
      );
      console.log(
        "URL:",
        config.baseURL ? `${config.baseURL}${config.url}` : config.url
      );
      console.log("Method:", config.method);
      // Avoid printing huge headers; print a subset useful for debugging
      console.log("Headers:", {
        Accept: config.headers?.Accept,
        "Content-Type": config.headers?.["Content-Type"] || "(not set)",
      });
      if (config.data instanceof FormData) {
        console.log("Request body: FormData (keys):", [...config.data.keys()]);
      } else {
        console.log("Request body:", config.data);
      }
      console.groupEnd();
    } catch (e) {
      console.warn("[API] Failed to log request details", e);
    }
    return config;
  },
  (error) => {
    console.error("[API] Request error", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    try {
      const endTime = new Date();
      const startTime = response.config?.metadata?.startTime || endTime;
      const durationMs = endTime - startTime;
      console.groupCollapsed(
        "[API] Response <-",
        response.config?.method?.toUpperCase(),
        response.config?.url,
        `(${durationMs} ms)`
      );
      console.log("Status:", response.status);
      // Log small summary of response data (avoid huge dumps)
      if (response.data && typeof response.data === "object") {
        try {
          const preview = Array.isArray(response.data)
            ? `Array(${response.data.length})`
            : Object.keys(response.data).slice(0, 10);
          console.log("Data preview:", preview);
        } catch (e) {
          console.log("Response data (non-serializable)");
        }
      } else {
        console.log("Data:", response.data);
      }
      console.groupEnd();
    } catch (e) {
      console.warn("[API] Failed to log response", e);
    }
    return response;
  },
  (error) => {
    // Response errors including network errors and non-2xx
    try {
      console.groupCollapsed("[API] Response Error");
      console.error("axios error message:", error.message);
      if (error.code) console.log("code:", error.code);
      if (error.config) {
        console.log(
          "request url:",
          error.config.baseURL
            ? `${error.config.baseURL}${error.config.url}`
            : error.config.url
        );
        console.log("method:", error.config.method);
        const startTime = error.config.metadata?.startTime;
        if (startTime) console.log("started at:", startTime);
      }
      if (error.request) {
        // request was sent but no response received
        console.log(
          "request sent, no response received (error.request):",
          error.request
        );
      }
      if (error.response) {
        console.log("status:", error.response.status);
        console.log("response headers:", error.response.headers);
        console.log("response data:", error.response.data);
      }
      console.groupEnd();
    } catch (e) {
      console.warn("[API] Failed to log response error", e);
    }
    // Create a normalized error for consumers
    if (error.response) {
      const payload = error.response.data;
      const msg = payload?.message || JSON.stringify(payload) || error.message;
      return Promise.reject(new Error(msg));
    }
    // network or other errors
    const networkMsg = `Network Error: ${error.message} (possible CORS, backend down, or connection refused)`;
    return Promise.reject(new Error(networkMsg));
  }
);

// Function to upload resume file
export const uploadResume = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/resume/upload", formData, {
      // Do not set Content-Type header here. Let the browser add the
      // multipart boundary. Keep upload progress tracking though.
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload Progress: ${percentCompleted}%`);
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading resume:", error);
    throw error;
  }
};

// Function to receive analyzed data
export const getAnalyzedData = async (resumeId) => {
  try {
    const response = await api.get(`/resume/analyze/${resumeId}`);
    return response.data;
  } catch (error) {
    // normalize and throw a clearer Error
    console.error("Error fetching analyzed data:", error);
    if (error.response) {
      const payload = error.response.data;
      const msg = payload?.message || JSON.stringify(payload) || error.message;
      throw new Error(msg);
    }
    throw error;
  }
};

// Function to analyze resume (combines upload and analysis if needed)
export const analyzeResume = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/analyze/resume", formData, {
      // trust browser to set Content-Type with boundary
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Analysis Progress: ${percentCompleted}%`);
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error analyzing resume:", error);
    // Provide a clearer message for the UI when server returns structured errors
    if (error.response) {
      const payload = error.response.data;
      const msg = payload?.message || JSON.stringify(payload) || error.message;
      throw new Error(msg);
    }
    throw error;
  }
};

// Function to get all analysis results
export const getAllAnalyses = async () => {
  try {
    const response = await api.get("/resume/analyses");
    return response.data;
  } catch (error) {
    console.error("Error fetching all analyses:", error);
    throw error;
  }
};

// Function to delete a resume analysis
export const deleteAnalysis = async (resumeId) => {
  try {
    const response = await api.delete(`/resume/delete/${resumeId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting analysis:", error);
    throw error;
  }
};

// Export default api instance for custom requests
export default api;
