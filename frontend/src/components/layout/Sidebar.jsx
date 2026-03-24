import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout, selectUser, selectIsAdmin } from '../../store/authSlice.js'

export default function Sidebar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user     = useSelector(selectUser)
  const isAdmin  = useSelector(selectIsAdmin)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const initiales = `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase() || '?'

  const navCls = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`

  return (
    <aside className="sidebar">
      {/* Marque */}
      <div className="sidebar-brand">
        <h2>EduPortail</h2>
        <span>Portail académique</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Général</div>
        <NavLink to="/" end className={navCls}>
          <span className="nav-icon">⊞</span> Tableau de bord
        </NavLink>

        <div className="nav-section-label">Gestion</div>
        <NavLink to="/users" className={navCls}>
          <span className="nav-icon">👥</span> Utilisateurs
        </NavLink>
        <NavLink to="/departments" className={navCls}>
          <span className="nav-icon">🏛</span> Départements
        </NavLink>
        <NavLink to="/subjects" className={navCls}>
          <span className="nav-icon">📚</span> Matières
        </NavLink>
        <NavLink to="/laboratories" className={navCls}>
          <span className="nav-icon">🔬</span> Laboratoires
        </NavLink>
        <NavLink to="/equipment" className={navCls}>
          <span className="nav-icon">🔧</span> Équipements
        </NavLink>

        {/* Section admin uniquement */}
        {isAdmin && (
          <>
            <div className="nav-section-label">Administration</div>
            <NavLink to="/roles" className={navCls}>
              <span className="nav-icon">🛡</span> Rôles
            </NavLink>
          </>
        )}
      </nav>

      {/* Utilisateur connecté */}
      <div className="sidebar-footer">
        <div className="user-badge">
          <div className="user-avatar">
            {user?.photo
              ? <img src={user.photo} alt="avatar" />
              : initiales}
          </div>
          <div className="user-info">
            <strong>{user?.prenom} {user?.nom}</strong>
            <span>{user?.email}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Déconnexion">⏻</button>
        </div>
      </div>
    </aside>
  )
}
