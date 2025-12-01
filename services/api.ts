const API_URL = '/api';

export const api = {
    async get(endpoint: string) {
        try {
            const token = localStorage.getItem('token');
            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(`${API_URL}${endpoint}`, { headers });
            if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
            return await res.json();
        } catch (e) {
            console.error(`GET ${endpoint} failed`, e);
            return null;
        }
    },

    async post(endpoint: string, data: any) {
        try {
            const token = localStorage.getItem('token');
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
            return await res.json();
        } catch (e) {
            console.error(`POST ${endpoint} failed`, e);
            return null;
        }
    },

    async delete(endpoint: string) {
        try {
            const token = localStorage.getItem('token');
            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'DELETE',
                headers
            });
            if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
            return await res.json();
        } catch (e) {
            console.error(`DELETE ${endpoint} failed`, e);
            return null;
        }
    }
};
