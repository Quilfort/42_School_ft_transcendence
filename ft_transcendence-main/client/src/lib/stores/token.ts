import { getAuthenticatedUser } from "$lib/functions/auth";
import { getMyChannels } from "$lib/functions/channels";

/**
 * The promise resolves when everything is done, or it rejects if there's an error.
 * @returns The fetchToken function now returns a promise
 */
async function fetchToken() {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const token = await getToken();
      if (token) {
        await getMyChannels();
        await getAuthenticatedUser();
        resolve(); // Resolve the promise when everything is done
      } else {
        // Handle the case when the token is missing or invalid
        console.error("JWT token not found.");
        reject(new Error("JWT token not found."));
      }
    } catch (error) {
      // Handle any errors that may occur during API requests or token retrieval
      console.error("Error fetching token or making authenticated requests:", error);
      reject(error);
    }
  });
}

async function getToken() {
  try {
    return new Promise<string | null>((resolve) => {
      setTimeout(() => {
        const token = localStorage.getItem("jwt_token");
        if (!token) {
          console.error("JWT token not found in localStorage.");
        }
        resolve(token);
      }, 1000)
    });
  } catch (error) {
    // Handle errors related to localStorage operations
    console.error("Error fetching token from localStorage:", error);
    return null; // Return null if there's an error
  }
}

export { fetchToken, getToken };