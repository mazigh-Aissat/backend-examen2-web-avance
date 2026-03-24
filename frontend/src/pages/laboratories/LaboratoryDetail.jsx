import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { laboratoryService } from '../../services/api.js'
import {
  LoadingScreen, HeroImage, ModeleBadge, StatutBadge, ConfirmModal, Alert
} from '../../components/common/index.jsx'

export default function LaboratoryDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [lab,       setLab]       = useState(null)
  const [equipments, setEquipments] = useState([])
  const [subjects,  setSubjects]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('info')
  const [deleteId,  setDeleteId]  = useState(null)
  const [deleting,  setDeleting]  = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [lRes, eRes, sRes] = await Promise.all([
          laboratoryService.getById(id),
          laboratoryService.getEquipments(id).catch(() => ({ data: { data: [] } })),
          laboratoryService.getSubjects(id).catch(()   => ({ data: { data: [] } })),
        ])
        // detailsLaboratory retourne { data: lab } avec Department inclus
        setLab(lRes.data?.data)
        setEquipments(eRes.data?.data ?? [])
        setSubjects(sRes.data?.data   ?? [])
      } catch {
        navigate('/laboratories')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await laboratoryService.delete(id)
      navigate('/laboratories')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erreur lors de la suppression')
      setDeleting(false)
      setDeleteId(null)
    }
  }

  if (loading) return <LoadingScreen />
  if (!lab)    return null

  return (
    <div className="fade-in">
      {error && <Alert type="error">{error}</Alert>}

      <div className="page-header">
        <div>
          <h1>{lab.nom}</h1>
          {lab.salle && <p className="page-subtitle">📍 Salle {lab.salle}</p>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/laboratories/${id}/edit`} className="btn btn-secondary">✏ Modifier</Link>
          <button className="btn btn-danger" onClick={() => setDeleteId(id)}>🗑 Supprimer</button>
        </div>
      </div>

      <div className="detail-hero">
        <HeroImage src={lab.image} alt={lab.nom} fallbackIcon="🔬" />
        {lab.information && (
          <div className="detail-hero-body">
            <p style={{ color: 'var(--text2)', fontSize: '0.9rem', lineHeight: 1.6 }}>{lab.information}</p>
          </div>
        )}
      </div>

      <div className="tabs">
        {[
          ['info',     'Informations'],
          ['equip',    `Équipements (${equipments.length})`],
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
              ['Nom',         lab.nom],
              ['Salle',       lab.salle       || '—'],
              ['Département', lab.Department?.nom || '—'],
            ].map(([l, v]) => (
              <div className="info-row" key={l}>
                <span className="info-label">{l}</span>
                <span className="info-value">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'equip' && (
        equipments.length === 0 ? (
          <p style={{ color: 'var(--text3)', padding: '16px 0' }}>Aucun équipement dans ce laboratoire.</p>
        ) : (
          <div className="grid grid-2">
            {equipments.map(e => (
              <Link to={`/equipment/${e.id}`} key={e.id} className="card" style={{ textDecoration: 'none' }}>
                <div className="card-body">
                  <div className="card-title">{e.nom}</div>
                  <div style={{ marginTop: 6 }}><ModeleBadge modele={e.modele} /></div>
                  {e.description && <p className="card-text" style={{ marginTop: 6 }}>{e.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {activeTab === 'subjects' && (
        subjects.length === 0 ? (
          <p style={{ color: 'var(--text3)', padding: '16px 0' }}>Aucune matière dans ce laboratoire.</p>
        ) : (
          <div className="grid grid-2">
            {subjects.map(s => (
              <Link to={`/subjects/${s.id}`} key={s.id} className="card" style={{ textDecoration: 'none' }}>
                <div className="card-body">
                  <div className="card-title">{s.nom}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                    <span className="badge badge-gray">{s.code}</span>
                    {s.statut && <StatutBadge statut={s.statut} />}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {deleteId && (
        <ConfirmModal
          message="Supprimer ce laboratoire ?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
