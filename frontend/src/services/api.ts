import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'

const getBaseURL = () => {
    const url = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'
    return url.endsWith('/') ? url : `${url}/`
}

const api: AxiosInstance = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
    withCredentials: true,
})

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('access_token')
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`
            }
        }
        return config
    },
    (error: AxiosError) => {
        return Promise.reject(error)
    }
)

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshToken = localStorage.getItem('refresh_token')
                if (!refreshToken) {
                    throw new Error('No refresh token')
                }

                const response = await axios.post(`${getBaseURL()}auth/refresh/`, {
                    refresh: refreshToken,
                })

                const { access } = response.data
                localStorage.setItem('access_token', access)

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${access}`
                }
                return api(originalRequest)
            } catch (refreshError) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                if (typeof window !== 'undefined') {
                    window.location.href = '/login'
                }
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

// ============================================
// API Helper Functions
// ============================================

// --- Auth ---
export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/auth/login/', { email, password }),

    logout: () =>
        api.post('/auth/logout/'),

    refreshToken: (refresh: string) =>
        api.post('/auth/refresh/', { refresh }),
}

// --- Patient Profile ---
export const patientAPI = {
    getProfile: () =>
        api.get('/patients/me/'),

    updateProfile: (data: any) =>
        api.patch('/patients/me/', data),
}

// --- Metrics ---
export const metricsAPI = {
    getMetrics: () =>
        api.get('/patients/me/metrics/'),

    createMetric: (data: any) =>
        api.post('/patients/me/metrics/', data),
}

// --- Meals / Diet ---
export const mealsAPI = {
    getDiet: () =>
        api.get('/patients/me/diet/'),

    getMeals: (date?: string) =>
        api.get('/patients/me/meals/', { params: { date } }),

    checkInMeal: (mealId: number) =>
        api.post(`/patients/me/meals/${mealId}/check-in/`),
}

// --- Evolution / Progress ---
export const evolutionAPI = {
    getEvolution: (metric?: string) =>
        api.get('/patients/me/evolution/', { params: { metric } }),

    getMeasurements: () =>
        api.get('/patients/me/measurements/'),

    uploadPhotos: (photos: FormData) =>
        api.post('/patients/me/photos/', photos, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    getComparisonPhotos: () =>
        api.get('/patients/me/photos/comparison/'),

    submitEvaluation: (data: any) =>
        api.post('/patients/me/evaluations/', data),
}

// --- Appointments ---
export const appointmentsAPI = {
    getAppointments: (status?: 'upcoming' | 'past') =>
        api.get('/patients/me/appointments/', { params: { status } }),

    confirmAppointment: (appointmentId: number) =>
        api.post(`/patients/me/appointments/${appointmentId}/confirm/`),

    cancelAppointment: (appointmentId: number) =>
        api.delete(`/patients/me/appointments/${appointmentId}/`),
}

// --- Messages ---
export const messagesAPI = {
    getConversations: () =>
        api.get('/patients/me/messages/'),

    getMessages: (conversationId: number) =>
        api.get(`/messages/${conversationId}/`),

    sendMessage: (conversationId: number, content: string) =>
        api.post('/messages/', { conversation: conversationId, content }),

    markAsRead: (messageId: number) =>
        api.patch(`/messages/${messageId}/`, { is_read: true }),
}

// --- Settings ---
export const settingsAPI = {
    getSettings: () =>
        api.get('/patients/me/settings/'),

    updateSettings: (data: any) =>
        api.patch('/patients/me/settings/', data),

    getNotifications: () =>
        api.get('/patients/me/notifications/'),
}

export default api

