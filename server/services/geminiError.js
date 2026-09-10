export const getStatusCode = (error) => {
  return (
    error?.status ??
    error?.statusCode ??
    error?.response?.status ??
    error?.cause?.status ??
    500
  );
};

export const getGeminiError = (error) => {
  const status = getStatusCode(error);

  switch (status) {
    case 400:
      return {
        code: "BAD_REQUEST",
        message: "Invalid request sent to Gemini.",
      };

    case 401:
      return {
        code: "INVALID_API_KEY",
        message: "Gemini API key is invalid or expired.",
      };

    case 403:
      return {
        code: "PERMISSION_DENIED",
        message: "You don't have permission to use this Gemini resource.",
      };

    case 404:
      return {
        code: "MODEL_NOT_FOUND",
        message: "The requested Gemini model was not found.",
      };

    case 429:
      return {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Gemini API limit or quota exceeded. Please try again later.",
      };

    case 500:
    case 502:
    case 503:
      return {
        code: "GEMINI_SERVER_ERROR",
        message: "Gemini is temporarily unavailable. Please try again later.",
      };

    default:
      return {
        code: "AI_ERROR",
        message:
          error?.message ||
          "Something went wrong while processing your request.",
      };
  }
};