import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken')
      if (token) {
        config.headers.Authorization = `Token ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login/', { email, password }),
  
  refreshToken: (refresh: string) =>
    api.post('/api/token/refresh/', { refresh }),
  
  getCurrentUser: () =>
    api.get('/api/auth/me/'),
}

// Users API
export const usersAPI = {
  getUsers: (params?: any) =>
    api.get('/api/admin/users/', { params }),
  
  getUser: (id: number) =>
    api.get(`/api/admin/users/${id}/`),
  
  createUser: (data: any) =>
    api.post('/api/admin/users/', data),
  
  deleteUser: (id: number) =>
    api.delete(`/api/admin/users/${id}/`),
  
  toggleVerification: (id: number) =>
    api.post(`/api/admin/users/${id}/toggle_verification/`),
  
  toggleBan: (id: number) =>
    api.post(`/api/admin/users/${id}/toggle_ban/`),
  
  getStatistics: () =>
    api.get('/api/admin/users/statistics/'),
}

// News API
export const newsAPI = {
  getNews: (params?: any) =>
    api.get('/api/news/articles/', { params }),
  
  getNewsItem: (id: number) =>
    api.get(`/api/news/articles/${id}/`),
  
  createNews: (data: FormData) =>
    api.post('/api/news/articles/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  updateNews: (id: number, data: FormData) =>
    api.patch(`/api/news/articles/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  deleteNews: (id: number) =>
    api.delete(`/api/news/articles/${id}/`),
  
  publishNews: (id: number) =>
    api.post(`/api/news/articles/${id}/publish/`),
  
  unpublishNews: (id: number) =>
    api.post(`/api/news/articles/${id}/unpublish/`),
  
  archiveNews: (id: number) =>
    api.post(`/api/news/articles/${id}/archive/`),
}

// Categories API
export const categoriesAPI = {
  getCategories: () =>
    api.get('/api/news/categories/'),
  
  createCategory: (data: any) =>
    api.post('/api/news/categories/', data),
  
  updateCategory: (slug: string, data: any) =>
    api.patch(`/api/news/categories/${slug}/`, data),
  
  deleteCategory: (slug: string) =>
    api.delete(`/api/news/categories/${slug}/`),
}

// Admins API
export const adminsAPI = {
  getAdmins: (params?: any) =>
    api.get('/api/admin/admins/', { params }),
  
  getAdmin: (id: number) =>
    api.get(`/api/admin/admins/${id}/`),
  
  createAdmin: (data: any) =>
    api.post('/api/admin/admins/', data),
  
  updateAdmin: (id: number, data: any) =>
    api.patch(`/api/admin/admins/${id}/`, data),
  
  deleteAdmin: (id: number) =>
    api.delete(`/api/admin/admins/${id}/`),
  
  toggleActive: (id: number) =>
    api.post(`/api/admin/admins/${id}/toggle_active/`),
  
  getStatistics: () =>
    api.get('/api/admin/admins/statistics/'),
}
