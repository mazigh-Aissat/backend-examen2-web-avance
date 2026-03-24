import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAdmin } from '../../store/authSlice.js'

// Redirige vers / si pas le rôle admin
export default function AdminRoute() {
  const isAdmin = useSelector(selectIsAdmin)
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />
}
