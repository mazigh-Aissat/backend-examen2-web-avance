import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUser } from '../store/authSlice.js'
import {
  userService, departmentService, subjectService,
  laboratoryService, equipmentService
} from '../services/api.js'
import { LoadingScreen } from '../components/common/index.jsx'

export default function Dashboard() {
  const user    = useSelector(selectUser)
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [u, d, s, l, e] = await Promise.allSettled([
          userService.getAll(),
          departmentService.getAll(),
          subjectService.getAll(),
          laboratoryService.getAll(),
          equipmentService.getAll(),
        ])
        setStats({
          // Chaque liste retourne { data: { users/departments/..., total } }
          users:    u.value?.data?.data?.total       ?? '—',
          depts:    d.value?.data?.data?.total       ?? '—',
          subjects: s.value?.data?.data?.total       ?? '—',
          labs:     l.value?.data?.data?.total       ?? '—',
          equip:    e.value?.data?.data?.total       ?? '—',
        })
      } catch {
        setStats({ users:'—', depts:'—', subjects:'—', labs:'—', equip:'—' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const statItems = [
    { label: 'Utilisateurs',  value: stats?.users,    icon: '👥', to: '/users'        },
    { label: 'Départements',  value: stats?.depts,    icon: '🏛',  to: '/departments'  },
    { label: 'Matières',      value: stats?.subjects, icon: '📚', to: '/subjects'     },
    { label: 'Laboratoires',  value: stats?.labs,     icon: '🔬', to: '/laboratories' },
    { label: 'Équipements',   value: stats?.equip,    icon: '🔧', to: '/equipment'    },
  ]

  const quickLinks = [
    { label: 'Nouvel utilisateur',  to: '/users/new',        icon: '➕' },
    { label: 'Nouveau département', to: '/departments/new',  icon: '➕' },
    { label: 'Nouvelle matière',    to: '/subjects/new',     icon: '➕' },
    { label: 'Nouveau laboratoire', to: '/laboratories/new', icon: '➕' },
    { label: 'Nouvel équipement',   to: '/equipment/new',    icon: '➕' },
  ]

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Bonjour, {user?.prenom} 👋</h1>
          <p className="page-subtitle">Bienvenue sur votre tableau de bord académique</p>
        </div>
      </div>

      {loading ? <LoadingScreen /> : (
        <>
          {/* Statistiques */}
          <div className="stat-grid">
            {statItems.map(s => (
              <Link to={s.to} key={s.label} className="stat-card">
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </Link>
            ))}
          </div>

          {/* Actions rapides */}
          <div className="card">
            <div className="card-body">
              <h3 style={{ marginBottom: 16 }}>Actions rapides</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {quickLinks.map(l => (
                  <Link key={l.to} to={l.to} className="btn btn-secondary">
                    {l.icon} {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
