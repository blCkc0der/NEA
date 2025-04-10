import { logout, refreshToken } from "./auth";

export async function authFetch(url: string, options: RequestInit = {}) {
    let accessToken = localStorage.getItem('accessToken');
    
    // Initial request
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  
    // Token expired? Try to refresh
    if (response.status === 401) {
      try {
        const newToken = await refreshToken();
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`,
          },
        });
      } catch (error) {
        logout();
        throw error;
      }
    }
  
    return response;
  }
