const BASE_URL = "/api";

/**
 * A simple wrapper around native fetch that handles:
 * 1. Base URL
 * 2. Standard JSON headers
 * 3. Including cookies (credentials: "include")
 * 4. Automatic Token Refresh on 401
 */
const request = async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;

    // Default options
    const config = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        credentials: "include", // Essential for cookies
    };

    let response = await fetch(url, config);

    // If we get a 401 (Unauthorized), try to refresh the token ONCE
    if (response.status === 401 && !options._isRetry) {
        console.log("Access token expired, attempting refresh...");

        const refreshResponse = await fetch(`${BASE_URL}/refresh-token`, {
            method: "POST",
            credentials: "include",
        });

        if (refreshResponse.ok) {
            console.log("Token refreshed successfully, retrying request.");
            // Retry the original request with a flag to prevent infinite loops
            return request(endpoint, { ...options, _isRetry: true });
        } else {
            console.warn("Refresh token expired or invalid. User must login again.");
            // You could trigger a logout redirect here if needed
        }
    }

    // Throw error for non-2xx responses so React Query can catch them
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Something went wrong");
    }

    return response.json();
};

export const api = {
    get: (url) => request(url, { method: "GET" }),
    post: (url, body) => request(url, { method: "POST", body: JSON.stringify(body) }),
    patch: (url, body) => request(url, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (url) => request(url, { method: "DELETE" }),
};
