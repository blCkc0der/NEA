const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Login and store tokens in localStorage
export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/api/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw new Error('Login failed');
  
  const { access, refresh } = await response.json();
  
  // Store tokens in localStorage
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
  
  return { access, refresh };
};

// Refresh access token
export const refreshToken = async () => {
  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) throw new Error('No refresh token');

  const response = await fetch(`${API_URL}/api/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    logout(); // Clear tokens if refresh fails
    throw new Error('Token refresh failed');
  }

  const { access } = await response.json();
  localStorage.setItem('accessToken', access);
  return access;
};

// Logout
export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
};
