// Environment-based API configuration
const getBaseUrl = () => {
  // return "http://172.16.11.97:9000/api/v1";
  const env = import.meta.env.VITE_ENV || "development";
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  if (apiUrl) {
    return apiUrl;
  }

  // Fallback URLs based on environment
  switch (env) {
    case "production":
      return "https://api.aameego.com/api/v1";
    case "development":  
    return "https://dev.aameego.com/api/v1";
    default:
      return "https://dev.aameego.com/api/v1";
  }
};

export const baseUrl = getBaseUrl();

// Log the current environment and API URL for debugging
console.log(
  `🚀 Admin Panel - Environment: ${import.meta.env.VITE_ENV || "development"}`
);
console.log(`🔗 API Base URL: ${baseUrl}`);
