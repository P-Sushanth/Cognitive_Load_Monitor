const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : ''; // In production, the API and frontend will run on the same domain.

const api = {
    async request(endpoint, method = 'GET', body = null) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['x-auth-token'] = token;
        }

        const config = {
            method,
            headers
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        try {
            const res = await fetch(`${API_URL}${endpoint}`, config);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.msg || 'Something went wrong');
            }
            return data;
        } catch (err) {
            console.error('API Error:', err);
            throw err;
        }
    }
};
