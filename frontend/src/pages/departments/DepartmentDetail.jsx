import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { departmentService } from '../../services/api.js'
import {
  LoadingScreen, HeroImage, DomaineBadge, ConfirmModal, Alert
} from '../../components/common/index.jsx'

export default function DepartmentDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [dept,     setDept]     = useState(null)
  const [users,    setUsers]    = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [activeTab, setActiveTab] = useState('info')
  const [deleteId, setDeleteId]   = useState(null)
  const [deleting, setDeleting]   = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [dRes, uRes, sRes] = await Promise.all([
          departmentService.getById(id),
          departmentService.getUsers(id).catch(()   => ({ data: { data: [] } })),
          departmentService.getSubjects(id).catch(() => ({ data: { data: [] } })),
        ])
        setDept(dRes.data?.data)
        setUsers(uRes.data?.data    ?? [])
        setSubjects(sRes.data?.data ?? [])
      } catch {
        navigate('/departments')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await departmentService.delete(id)
      navigate('/departments')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erreur lors de la suppression')
      setDeleting(false)
      setDeleteId(null)
    }
  }

  if (loading) return <LoadingScreen />
  if (!dept)   return null

  return (
    <div className="fade-in">
      {error && <Alert type="error">{error}</Alert>}

      <div className="page-header">
        <div>
          <h1>{dept.nom}</h1>
          <div style={{ marginTop: 4 }}><DomaineBadge domaine={dept.domaine} /></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/departments/${id}/edit`} className="btn btn-secondary">✏ Modifier</Link>
          <button className="btn btn-danger" onClick={() => setDeleteId(id)}>🗑 Supprimer</button>
        </div>
      </div>

      <div className="detail-hero">
        <HeroImage src={dept.image} alt={dept.nom} fallbackIcon="🏛" />
        {dept.histoire && (
          <div className="detail-hero-body">
            <p style={{ color: 'var(--text2)', fontSize: '0.9rem', lineHeight: 1.6 }}>{dept.histoire}</p>
          </div>
        )}
      </div>

      <div className="tabs">
        {[
          ['info',     'Informations'],
          ['users',    `Utilisateurs (${users.length})`],
          ['subjects', `Matières (${subjects.length})`],
        ].map(([t, label]) => (
          <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="card">
          <div className="card-body">
            {[
              ['Nom',     dept.nom],
              ['Domaine', dept.domaine],
            ].map(([l, v]) => (
              <div className="info-row" key={l}>
                <span className="info-label">{l}</span>
                <span className="info-value">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Nom</th><th>Email</th><th>Conduite</th><th></th></tr></thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text3)' }}>Aucun utilisateur</td></tr>
              ) : users.map(u => (
                <tr key={u.id}>
                  <td className="td-main">{u.prenom} {u.nom}</td>
                  <td>{u.email}</td>
                  <td>{u.conduite || '—'}</td>
                  <td><Link to={`/users/${u.id}`} className="btn btn-secondary btn-sm">👁</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'subjects' && (
        subjects.length === 0 ? (
          <p style={{ color: 'var(--text3)', padding: '16px 0' }}>Aucune matière dans ce département.</p>
        ) : (
          <div className="grid grid-2">
            {subjects.map(s => (
              <Link to={`/subjects/${s.id}`} key={s.id} className="card" style={{ textDecoration: 'none' }}>
                <div className="card-body">
                  <div className="card-title">{s.nom}</div>
                  <div className="card-text">{s.code}</div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {deleteId && (
        <ConfirmModal
          message="Supprimer ce département ?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
