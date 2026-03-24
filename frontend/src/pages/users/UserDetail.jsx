import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { userService, roleService, subjectService } from '../../services/api.js'
import {
  LoadingScreen, HeroImage, ConducteBadge, RoleBadge, ConfirmModal, Alert, StatutBadge
} from '../../components/common/index.jsx'

export default function UserDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [user,       setUser]       = useState(null)
  const [subjects,   setSubjects]   = useState([])
  const [allRoles,   setAllRoles]   = useState([])
  const [allSubjects,setAllSubjects]= useState([])
  const [loading,    setLoading]    = useState(true)
  const [activeTab,  setActiveTab]  = useState('info')
  const [deleteId,   setDeleteId]   = useState(null)
  const [deleting,   setDeleting]   = useState(false)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState('')
  // Pour mise à jour photo
  const [photoLoading, setPhotoLoading] = useState(false)
  const photoRef = useRef()
  // Pour assigner rôles
  const [selectedRoles, setSelectedRoles]   = useState([])
  const [savingRoles,   setSavingRoles]     = useState(false)
  // Pour inscrire matières
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [savingSubjects,   setSavingSubjects]   = useState(false)

  const loadUser = async () => {
    try {
      const [uRes, sRes] = await Promise.all([
        userService.getById(id),
        userService.getSubjects(id).catch(() => ({ data: { data: [] } })),
      ])
      const u = uRes.data?.data
      setUser(u)
      setSubjects(sRes.data?.data ?? [])
      // Pré-sélectionner les rôles actuels
      setSelectedRoles(u?.Roles?.map(r => r.id) ?? [])
    } catch {
      navigate('/users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
    // Charger tous les rôles et matières disponibles
    roleService.getAll()
      .then(r => setAllRoles(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => {})
    subjectService.getAll({ size: 100 })
      .then(r => setAllSubjects(r.data?.data?.subjects ?? []))
      .catch(() => {})
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await userService.delete(id)
      navigate('/users')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erreur lors de la suppression')
      setDeleting(false)
      setDeleteId(null)
    }
  }

  // ── Mise à jour photo ──────────────────────────────────
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('photo', file)
      await userService.updatePhoto(id, fd)
      setSuccess('Photo mise à jour !')
      loadUser()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erreur lors de la mise à jour de la photo')
    } finally {
      setPhotoLoading(false)
    }
  }

  // ── Assigner rôles ─────────────────────────────────────
  const toggleRole = (roleId) => {
    setSelectedRoles(prev =>
      prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
    )
  }

  const handleSaveRoles = async () => {
    setSavingRoles(true)
    setError('')
    try {
      await userService.addRoles(id, { ids: selectedRoles })
      setSuccess('Rôles mis à jour !')
      loadUser()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erreur lors de la mise à jour des rôles')
    } finally {
      setSavingRoles(false)
    }
  }

  // ── Inscrire matières ──────────────────────────────────
  const toggleSubject = (subjectId) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId) ? prev.filter(s => s !== subjectId) : [...prev, subjectId]
    )
  }

  const handleSaveSubjects = async () => {
    setSavingSubjects(true)
    setError('')
    try {
      await userService.addSubjects(id, { ids: selectedSubjects })
      setSuccess('Matières mises à jour !')
      setSelectedSubjects([])
      loadUser()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erreur lors de l\'inscription aux matières')
    } finally {
      setSavingSubjects(false)
    }
  }

  if (loading) return <LoadingScreen />
  if (!user)   return null

  return (
    <div className="fade-in">
      {error   && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <div className="page-header">
        <div>
          <h1>{user.prenom} {user.nom}</h1>
          <p className="page-subtitle">{user.email}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/users/${id}/edit`} className="btn btn-secondary">✏ Modifier</Link>
          <button className="btn btn-danger" onClick={() => setDeleteId(id)}>🗑 Supprimer</button>
        </div>
      </div>

      {/* Hero image avec bouton changer photo */}
      <div className="detail-hero">
        <div style={{ position: 'relative' }}>
          <HeroImage src={user.photo} alt={user.prenom} fallbackIcon="👤" />
          <label style={{
            position: 'absolute', bottom: 12, right: 12,
            background: 'rgba(0,0,0,.7)', color: '#fff',
            padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
            fontSize: '0.8rem', backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,.2)'
          }}>
            {photoLoading ? '⏳ Envoi...' : '📷 Changer la photo'}
            <input
              type="file" accept="image/*"
              ref={photoRef}
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
          </label>
        </div>
        <div className="detail-hero-body">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {user.conduite && <ConducteBadge conduite={user.conduite} />}
            {user.Roles?.map(r => <RoleBadge key={r.id} titre={r.titre} />)}
          </div>
          {user.biographie && (
            <p style={{ color: 'var(--text2)', fontSize: '0.9rem', lineHeight: 1.6 }}>{user.biographie}</p>
          )}
        </div>
      </div>

      {/* Onglets */}
      <div className="tabs">
        {[
          ['info',     'Informations'],
          ['roles',    `Rôles (${user.Roles?.length ?? 0})`],
          ['matieres', `Matières (${subjects.length})`],
        ].map(([t, label]) => (
          <button
            key={t}
            className={`tab-btn ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
          >{label}</button>
        ))}
      </div>

      {/* ── Onglet informations ── */}
      {activeTab === 'info' && (
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
              <div>
                {[
                  ['Prénom',    user.prenom    || '—'],
                  ['Nom',       user.nom       || '—'],
                  ['Email',     user.email],
                  ['Naissance', user.naissance || '—'],
                ].map(([l, v]) => (
                  <div className="info-row" key={l}>
                    <span className="info-label">{l}</span>
                    <span className="info-value">{v}</span>
                  </div>
                ))}
              </div>
              <div>
                {[
                  ['Conduite',    user.conduite         || '—'],
                  ['Département', user.Department?.nom  || '—'],
                ].map(([l, v]) => (
                  <div className="info-row" key={l}>
                    <span className="info-label">{l}</span>
                    <span className="info-value">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Onglet rôles ── */}
      {activeTab === 'roles' && (
        <div className="card">
          <div className="card-body">
            <h3 style={{ marginBottom: 16 }}>Gérer les rôles</h3>
            <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: 16 }}>
              Cochez les rôles à assigner à cet utilisateur :
            </p>
            {allRoles.length === 0 ? (
              <p style={{ color: 'var(--text3)' }}>Aucun rôle disponible. <Link to="/roles">Créer des rôles</Link></p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                {allRoles.map(r => (
                  <label key={r.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 14px',
                    background: selectedRoles.includes(r.id) ? 'rgba(108,138,255,.15)' : 'var(--bg3)',
                    border: `1px solid ${selectedRoles.includes(r.id) ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 8, cursor: 'pointer',
                    transition: 'all .2s'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(r.id)}
                      onChange={() => toggleRole(r.id)}
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{r.titre}</span>
                  </label>
                ))}
              </div>
            )}
            <button className="btn btn-primary" onClick={handleSaveRoles} disabled={savingRoles}>
              {savingRoles ? <><span className="spinner" /> Enregistrement...</> : '💾 Sauvegarder les rôles'}
            </button>
          </div>
        </div>
      )}

      {/* ── Onglet matières ── */}
      {activeTab === 'matieres' && (
        <div>
          {/* Matières actuelles */}
          {subjects.length > 0 && (
            <div className="grid grid-2" style={{ marginBottom: 24 }}>
              {subjects.map(s => (
                <Link to={`/subjects/${s.id}`} key={s.id} className="card" style={{ textDecoration: 'none' }}>
                  <div className="card-body">
                    <div className="card-title">{s.nom}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <span className="badge badge-gray">{s.code}</span>
                      {s.statut && <StatutBadge statut={s.statut} />}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Inscrire à de nouvelles matières */}
          <div className="card">
            <div className="card-body">
              <h3 style={{ marginBottom: 16 }}>Inscrire à des matières</h3>
              <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: 16 }}>
                Sélectionnez les matières à ajouter :
              </p>
              {allSubjects.length === 0 ? (
                <p style={{ color: 'var(--text3)' }}>Aucune matière disponible.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8, marginBottom: 16 }}>
                  {allSubjects.map(s => (
                    <label key={s.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 12px',
                      background: selectedSubjects.includes(s.id) ? 'rgba(108,138,255,.15)' : 'var(--bg3)',
                      border: `1px solid ${selectedSubjects.includes(s.id) ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 8, cursor: 'pointer', transition: 'all .2s'
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(s.id)}
                        onChange={() => toggleSubject(s.id)}
                        style={{ accentColor: 'var(--accent)' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{s.nom}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{s.code}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <button
                className="btn btn-primary"
                onClick={handleSaveSubjects}
                disabled={savingSubjects || selectedSubjects.length === 0}
              >
                {savingSubjects
                  ? <><span className="spinner" /> Inscription...</>
                  : `➕ Inscrire (${selectedSubjects.length} sélectionnée${selectedSubjects.length > 1 ? 's' : ''})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {deleteId && (
        <ConfirmModal
          message="Supprimer cet utilisateur définitivement ? Cette action est irréversible."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
