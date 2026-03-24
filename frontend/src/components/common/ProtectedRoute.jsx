import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuth } from '../../store/authSlice.js'

// Redirige vers /login si non connecté
export default function ProtectedRoute() {
  const isAuth = useSelector(selectIsAuth)
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />
}
