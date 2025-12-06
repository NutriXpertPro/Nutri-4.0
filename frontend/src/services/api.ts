import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('access_token')
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Interceptor para lidar com erros de resposta (401, refresh token - futuro)
api.interceptors.response.use(
    (response) => {
        return response
    },
    async (error) => {
        // Aqui poderíamos implementar a lógica de refresh token
        if (error.response?.status === 401) {
            // Por enquanto, apenas redireciona para login ou lança erro
            console.error('Unauthorized access')
        }
        return Promise.reject(error)
    }
)

export default api
