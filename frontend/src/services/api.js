import axios from 'axios'
import { store } from '../store/store.js'
import { logout } from '../store/authSlice.js'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({ baseURL: BASE_URL })

// Intercepteur REQUEST — injecte le token JWT
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Intercepteur RESPONSE — déconnexion automatique si 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      store.dispatch(logout())
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ─────────────────────────────────────────────────────────────
// FORMAT DES RÉPONSES DU BACKEND :
//
//  GET liste paginée : { data: { users/departments/..., total, currentPage, totalPages } }
//  GET un seul       : { data: <objet> }
//  GET relation      : { data: [tableau] }
//  POST/PUT/DELETE   : { message: "..." }
//  Login             : { data: <user>, token: "..." }
// ─────────────────────────────────────────────────────────────

export const authService = {
  // Retourne { data: user, token }
  login: (credentials) => api.post('/login', credentials),
}

export const userService = {
  // Retourne { data: { users: [], total, currentPage, totalPages } }
  getAll:      (params) => api.get('/users', { params }),
  // Retourne { data: user } avec Department, Roles, Subjects inclus
  getById:     (id)     => api.get(`/users/${id}`),
  getDepartment: (id)   => api.get(`/users/${id}/department`),
  getSubjects:   (id)   => api.get(`/users/${id}/subjects`),
  // POST avec FormData (photo)
  create:      (fd)     => api.post('/users', fd),
  // PUT sans photo (photo séparée)
  update:      (id, data) => api.put(`/users/${id}`, data),
  updatePhoto: (id, fd)   => api.put(`/users/${id}/photo`, fd),
  delete:      (id)       => api.delete(`/users/${id}`),
  addRoles:    (id, body) => api.post(`/users/${id}/roles`, body),    // { ids: [] }
  addSubjects: (id, body) => api.post(`/users/${id}/subjects`, body), // { ids: [] }
}

export const departmentService = {
  // Retourne { data: { departments: [], total, currentPage, totalPages } }
  getAll:      (params) => api.get('/departments', { params }),
  getById:     (id)     => api.get(`/departments/${id}`),
  getUsers:    (id)     => api.get(`/departments/${id}/users`),
  getSubjects: (id)     => api.get(`/departments/${id}/subjects`),
  create:      (fd)     => api.post('/departments', fd),
  update:      (id, data) => api.put(`/departments/${id}`, data),
  updateImage: (id, fd)   => api.put(`/departments/${id}/image`, fd),
  delete:      (id)       => api.delete(`/departments/${id}`),
}

export const subjectService = {
  // Retourne { data: { subjects: [], total, currentPage, totalPages } }
  getAll:        (params) => api.get('/subjects', { params }),
  getById:       (id)     => api.get(`/subjects/${id}`),
  getDepartment: (id)     => api.get(`/subjects/${id}/department`),
  getUsers:      (id)     => api.get(`/subjects/${id}/users`),
  create:        (fd)     => api.post('/subjects', fd),
  update:        (id, data) => api.put(`/subjects/${id}`, data),
  updateImage:   (id, fd)   => api.put(`/subjects/${id}/image`, fd),
  delete:        (id)       => api.delete(`/subjects/${id}`),
  addUsers:      (id, body) => api.post(`/subjects/${id}/users`, body), // { ids: [] }
}

export const laboratoryService = {
  // Retourne { data: { laboratories: [], total, currentPage, totalPages } }
  getAll:        (params) => api.get('/laboratories', { params }),
  getById:       (id)     => api.get(`/laboratories/${id}`),
  getEquipments: (id)     => api.get(`/laboratories/${id}/equipment`),
  getSubjects:   (id)     => api.get(`/laboratories/${id}/subjects`),
  create:        (fd)     => api.post('/laboratories', fd),
  update:        (id, data) => api.put(`/laboratories/${id}`, data),
  updateImage:   (id, fd)   => api.put(`/laboratories/${id}/image`, fd),
  delete:        (id)       => api.delete(`/laboratories/${id}`),
}

export const equipmentService = {
  // Retourne { data: { equipments: [], total, currentPage, totalPages } }
  getAll:      (params) => api.get('/equipment', { params }),
  getById:     (id)     => api.get(`/equipment/${id}`),
  create:      (fd)     => api.post('/equipment', fd),
  update:      (id, data) => api.put(`/equipment/${id}`, data),
  updateImage: (id, fd)   => api.put(`/equipment/${id}/image`, fd),
  delete:      (id)       => api.delete(`/equipment/${id}`),
}

export const roleService = {
  // Retourne { data: [] } (pas paginé)
  getAll:   ()     => api.get('/roles'),
  getById:  (id)   => api.get(`/roles/${id}`),
  getUsers: (id)   => api.get(`/roles/${id}/users`),
  create:   (data) => api.post('/roles', data),
  delete:   (id)   => api.delete(`/roles/${id}`),
}
