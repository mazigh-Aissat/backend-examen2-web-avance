import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { subjectService, userService } from '../../services/api.js'
import {
  LoadingScreen, HeroImage, StatutBadge, ConfirmModal, Alert, ConducteBadge
} from '../../components/common/index.jsx'

export default function SubjectDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [subject,      setSubject]      = useState(null)
  const [users,        setUsers]        = useState([])
  const [allUsers,     setAllUsers]     = useState([])
  const [selectedUsers,setSelectedUsers]= useState([])
  const [loading,      setLoading]      = useState(true)
  const [activeTab,    setActiveTab]    = useState('info')
  const [deleteId,     setDeleteId]     = useState(null)
  const [deleting,     setDeleting]     = useState(false)
  const [error,        setError]        = useState('')
  const [success,      setSuccess]      = useState('')
  const [savingUsers,  setSavingUsers]  = useState(false)

  const loadSubject = async () => {
    try {
      const [sRes, uRes] = await Promise.all([
        subjectService.getById(id),
        subjectService.getUsers(id).catch(() => ({ data: { data: [] } })),
      ])
      setSubject(sRes.data?.data)
      setUsers(uRes.data?.data ?? [])
    } catch {
      navigate('/subjects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubject()
    userService.getAll({ size: 100 })
      .then(r => setAllUsers(r.data?.data?.users ?? []))
      .catch(() => {})
  }, [id])

  const toggleUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(u => u !== userId) : [...prev, userId]
    )
  }

  const handleAddUsers = async () => {
    setSavingUsers(true)
    setError('')
    try {
      await subjectService.addUsers(id, { ids: selectedUsers })
      setSuccess('Étudiants inscrits avec succès !')
      setSelectedUsers([])
      loadSubject()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erreur lors de l\'inscription')
    } finally {
      setSavingUsers(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await subjectService.delete(id)
      navigate('/subjects')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erreur lors de la suppression')
      setDeleting(false)
      setDeleteId(null)
    }
  }

  if (loading)  return <LoadingScreen />
  if (!subject) return null

  return (
    <div className="fade-in">
      {error   && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <div className="page-header">
        <div>
          <h1>{subject.nom}</h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <span className="badge badge-gray">{subject.code}</span>
            {subject.statut && <StatutBadge statut={subject.statut} />}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/subjects/${id}/edit`} className="btn btn-secondary">✏ Modifier</Link>
          <button className="btn btn-danger" onClick={() => setDeleteId(id)}>🗑 Supprimer</button>
        </div>
      </div>

      <div className="detail-hero">
        <HeroImage src={subject.image} alt={subject.nom} fallbackIcon="📚" />
        {subject.description && (
          <div className="detail-hero-body">
            <p style={{ color: 'var(--text2)', fontSize: '0.9rem', lineHeight: 1.6 }}>{subject.description}</p>
          </div>
        )}
      </div>

      <div className="tabs">
        {[
          ['info',  'Informations'],
          ['users', `Étudiants inscrits (${users.length})`],
          ['add',   'Inscrire des étudiants'],
        ].map(([t, label]) => (
          <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {label}
          </button>
        ))}
      </div>

      {/* Onglet infos */}
      {activeTab === 'info' && (
        <div className="card">
          <div className="card-body">
            {[
              ['Nom',          subject.nom],
              ['Code',         subject.code],
              ['Statut',       subject.statut       || '—'],
              ['Département',  subject.Department?.nom  || '—'],
              ['Laboratoire',  subject.Laboratory?.nom  || '—'],
            ].map(([l, v]) => (
              <div className="info-row" key={l}>
                <span className="info-label">{l}</span>
                <span className="info-value">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Onglet étudiants inscrits */}
      {activeTab === 'users' && (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Nom</th><th>Email</th><th>Conduite</th><th></th></tr></thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text3)' }}>Aucun étudiant inscrit</td></tr>
              ) : users.map(u => (
                <tr key={u.id}>
                  <td className="td-main">{u.prenom} {u.nom}</td>
                  <td>{u.email}</td>
                  <td>{u.conduite ? <ConducteBadge conduite={u.conduite} /> : '—'}</td>
                  <td><Link to={`/users/${u.id}`} className="btn btn-secondary btn-sm">👁</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Onglet inscrire étudiants */}
      {activeTab === 'add' && (
        <div className="card">
          <div className="card-body">
            <h3 style={{ marginBottom: 16 }}>Inscrire des étudiants</h3>
            <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: 16 }}>
              Sélectionnez les utilisateurs à inscrire à cette matière :
            </p>
            {allUsers.length === 0 ? (
              <p style={{ color: 'var(--text3)' }}>Aucun utilisateur disponible.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8, marginBottom: 16 }}>
                {allUsers.map(u => (
                  <label key={u.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px',
                    background: selectedUsers.includes(u.id) ? 'rgba(108,138,255,.15)' : 'var(--bg3)',
                    border: `1px solid ${selectedUsers.includes(u.id) ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 8, cursor: 'pointer', transition: 'all .2s'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(u.id)}
                      onChange={() => toggleUser(u.id)}
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{u.prenom} {u.nom}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{u.email}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <button
              className="btn btn-primary"
              onClick={handleAddUsers}
              disabled={savingUsers || selectedUsers.length === 0}
            >
              {savingUsers
                ? <><span className="spinner" /> Inscription...</>
                : `➕ Inscrire (${selectedUsers.length} sélectionné${selectedUsers.length > 1 ? 's' : ''})`}
            </button>
          </div>
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          message="Supprimer cette matière ?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
