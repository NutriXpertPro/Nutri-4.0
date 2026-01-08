import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'

export const getBaseURL = () => {
    // Prioritize ENVIRONMENT VARIABLE (Next.js handles prefixing for browser automatically if defined)
    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (envUrl) {
        return envUrl.endsWith('/') ? envUrl : `${envUrl}/`;
    }

    // Fallback for local development
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:8000/api/v1/';
        }
        // If no env var and not localhost, we return a fallback based on hostname
        return `http://${hostname}:8000/api/v1/`;
    }

    return 'http://localhost:8000/api/v1/';
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
                // Remove cookies to prevent middleware from redirecting back to protected routes
                if (typeof window !== 'undefined') {
                    // Import dynamically or assume it's available if added to imports
                    // Since we can't easily change imports in this replace block effectively without touching top of file,
                    // we will use document.cookie for immediate safety or add import in a separate block.
                    // Let's add the import to the top of the file in a separate step or just use document.cookie fallback
                    // Actually, let's just use document.cookie = ... to expire it manually to be safe and dependency-free here
                    // Force expiry of cookies to clean up any state
                    document.cookie = 'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
                    document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
                    document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'

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
        api.post('auth/login/', { email, password }),

    logout: () =>
        api.post('auth/logout/'),

    refreshToken: (refresh: string) =>
        api.post('auth/refresh/', { refresh }),
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
        api.get('/messages/inbox/'),

    getMessages: (conversationId: number) =>
        api.get(`/messages/messages/?conversation=${conversationId}`),

    sendMessage: (conversationId: number, content: string) =>
        api.post('/messages/messages/', { content, conversation: conversationId }),

    findOrCreateByPatient: (patientId: number) =>
        api.post('/messages/conversations/find-or-create-by-patient/', { patient_id: patientId }).then(res => res.data),

    markAsRead: (messageId: number) =>
        api.patch(`/messages/messages/${messageId}/`, { is_read: true }),

    markAllAsRead: (conversationId: number) =>
        api.post(`/messages/conversations/${conversationId}/mark-all-as-read/`),
}

// --- Settings ---
export const settingsAPI = {
    getSettings: () =>
        api.get('/users/me/'),

    updateSettings: (data: any) =>
        api.patch('/users/me/', data),

    getNotifications: () =>
        api.get('/notifications/'),
}

export default api

