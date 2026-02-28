const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
    refreshSubscribers.map((cb) => cb(token));
    refreshSubscribers = [];
};

const getHeaders = () => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('accessToken');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    if (!window.location.hash.includes('login')) {
        window.location.hash = '#/login';
    }
};

const refreshToken = async (): Promise<string | null> => {
    const currentRefreshToken = localStorage.getItem('refreshToken');
    if (!currentRefreshToken) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: currentRefreshToken }),
        });

        if (!response.ok) throw new Error('Refresh failed');

        const { data } = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        return data.accessToken;
    } catch (error) {
        handleLogout();
        return null;
    }
};

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = { ...getHeaders(), ...options.headers };

    let response = await fetch(url, { ...options, headers });

    if (response.status === 401 && !endpoint.includes('/auth/refresh')) {
        if (!isRefreshing) {
            isRefreshing = true;
            const newToken = await refreshToken();
            isRefreshing = false;

            if (newToken) {
                onTokenRefreshed(newToken);
                return request<T>(endpoint, {
                    ...options,
                    headers: { ...options.headers, 'Authorization': `Bearer ${newToken}` }
                });
            }
        } else {
            return new Promise((resolve) => {
                subscribeTokenRefresh((token) => {
                    resolve(request<T>(endpoint, {
                        ...options,
                        headers: { ...options.headers, 'Authorization': `Bearer ${token}` }
                    }));
                });
            });
        }

        // If we reached here without a new token and we weren't just waiting, refresh failed
        handleLogout();
        throw new Error('Session expired');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
};

export const api = {
    get: async <T>(endpoint: string): Promise<T> => request<T>(endpoint, { method: 'GET' }),

    post: async <T>(endpoint: string, data: any): Promise<T> => request<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    put: async <T>(endpoint: string, data: any): Promise<T> => request<T>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    delete: async <T>(endpoint: string): Promise<T> => request<T>(endpoint, { method: 'DELETE' }),
};
