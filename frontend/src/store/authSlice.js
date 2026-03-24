import { createSlice } from '@reduxjs/toolkit'

// Persister la session dans localStorage
const savedUser  = localStorage.getItem('edu_user')
const savedToken = localStorage.getItem('edu_token')

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            savedUser  ? JSON.parse(savedUser)  : null,
    token:           savedToken ?? null,
    isAuthenticated: !!savedToken,
  },
  reducers: {
    // Le backend retourne { data: user, token }
    loginSuccess(state, action) {
      state.user            = action.payload.user
      state.token           = action.payload.token
      state.isAuthenticated = true
      localStorage.setItem('edu_token', action.payload.token)
      localStorage.setItem('edu_user',  JSON.stringify(action.payload.user))
    },
    logout(state) {
      state.user            = null
      state.token           = null
      state.isAuthenticated = false
      localStorage.removeItem('edu_token')
      localStorage.removeItem('edu_user')
    },
    // Pour mettre à jour le profil sans re-login
    updateCurrentUser(state, action) {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('edu_user', JSON.stringify(state.user))
    },
  },
})

export const { loginSuccess, logout, updateCurrentUser } = authSlice.actions

// Sélecteurs
export const selectToken   = (state) => state.auth.token
export const selectUser    = (state) => state.auth.user
export const selectIsAuth  = (state) => state.auth.isAuthenticated
export const selectIsAdmin = (state) =>
  state.auth.user?.Roles?.some(r => r.titre?.toLowerCase() === 'admin') ?? false
export const selectRoles   = (state) => state.auth.user?.Roles ?? []

export default authSlice.reducer
