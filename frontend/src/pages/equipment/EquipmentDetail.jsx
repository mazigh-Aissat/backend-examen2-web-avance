import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { equipmentService } from '../../services/api.js'
import {
  LoadingScreen, HeroImage, ModeleBadge, ConfirmModal, Alert
} from '../../components/common/index.jsx'

export default function EquipmentDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [equip,    setEquip]    = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => {
    // detailsEquipment retourne { data: equipment } avec Laboratory inclus
    equipmentService.getById(id)
      .then(r => setEquip(r.data?.data))
      .catch(() => navigate('/equipment'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await equipmentService.delete(id)
      navigate('/equipment')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erreur lors de la suppression')
      setDeleting(false)
      setDeleteId(null)
    }
  }

  if (loading) return <LoadingScreen />
  if (!equip)  return null

  return (
    <div className="fade-in">
      {error && <Alert type="error">{error}</Alert>}

      <div className="page-header">
        <div>
          <h1>{equip.nom}</h1>
          <div style={{ marginTop: 4 }}><ModeleBadge modele={equip.modele} /></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/equipment/${id}/edit`} className="btn btn-secondary">✏ Modifier</Link>
          <button className="btn btn-danger" onClick={() => setDeleteId(id)}>🗑 Supprimer</button>
        </div>
      </div>

      <div className="detail-hero">
        <HeroImage src={equip.image} alt={equip.nom} fallbackIcon="🔧" />
        {equip.description && (
          <div className="detail-hero-body">
            <p style={{ color: 'var(--text2)', fontSize: '0.9rem', lineHeight: 1.6 }}>{equip.description}</p>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-body">
          {[
            ['Nom',          equip.nom],
            ['Modèle',       equip.modele],
            ['Laboratoire',  equip.Laboratory?.nom || '—'],
          ].map(([l, v]) => (
            <div className="info-row" key={l}>
              <span className="info-label">{l}</span>
              <span className="info-value">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {equip.Laboratory && (
        <div style={{ marginTop: 16 }}>
          <Link to={`/laboratories/${equip.Laboratory.id}`} className="btn btn-secondary">
            🔬 Voir le laboratoire : {equip.Laboratory.nom}
          </Link>
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          message="Supprimer cet équipement ?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
