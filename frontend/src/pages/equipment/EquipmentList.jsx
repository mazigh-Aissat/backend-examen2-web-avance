import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { equipmentService } from '../../services/api.js'
import {
  LoadingScreen, EmptyState, ConfirmModal, ModeleBadge, CardImage
} from '../../components/common/index.jsx'

export default function EquipmentList() {
  const navigate = useNavigate()
  const [items,       setItems]       = useState([])
  const [total,       setTotal]       = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [filtreModele, setFiltreModele] = useState('')
  const [deleteId,    setDeleteId]    = useState(null)
  const [deleting,    setDeleting]    = useState(false)

  const load = async (searchVal = '') => {
    setLoading(true)
    try {
      const res = await equipmentService.getAll({ search: searchVal, size: 50 })
      // { data: { equipments: [], total } }
      const payload = res.data?.data
      setItems(payload?.equipments ?? [])
      setTotal(payload?.total      ?? 0)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSearch = (e) => { const v = e.target.value; setSearch(v); load(v) }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await equipmentService.delete(deleteId)
      setDeleteId(null)
      load(search)
    } catch {} finally { setDeleting(false) }
  }

  // Filtre modele côté client
  const filtered = filtreModele
    ? items.filter(e => e.modele === filtreModele)
    : items

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Équipements</h1>
          <p className="page-subtitle">{total} équipement{total !== 1 ? 's' : ''} au total</p>
        </div>
        <Link to="/equipment/new" className="btn btn-primary">➕ Ajouter</Link>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="form-control" placeholder="Rechercher..." value={search} onChange={handleSearch} />
        </div>
        <select
          className="form-control"
          style={{ width: 'auto', minWidth: 150 }}
          value={filtreModele}
          onChange={e => setFiltreModele(e.target.value)}
        >
          <option value="">Tous les modèles</option>
          <option value="nouveau">Nouveau</option>
          <option value="ancien">Ancien</option>
          <option value="refait">Refait</option>
        </select>
      </div>

      {loading ? <LoadingScreen /> : filtered.length === 0 ? (
        <EmptyState icon="🔧" title="Aucun équipement trouvé" action={<Link to="/equipment/new" className="btn btn-primary">➕ Ajouter</Link>} />
      ) : (
        <div className="grid grid-3">
          {filtered.map(e => (
            <div key={e.id} className="card">
              <CardImage src={e.image} alt={e.nom} fallbackIcon="🔧" />
              <div className="card-body">
                <div className="card-title">{e.nom}</div>
                <div style={{ margin: '5px 0' }}><ModeleBadge modele={e.modele} /></div>
                {e.description && (
                  <p className="card-text" style={{
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>{e.description}</p>
                )}
                {e.Laboratory && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: 6 }}>
                    🔬 {e.Laboratory.nom}
                  </div>
                )}
              </div>
              <div className="card-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/equipment/${e.id}`)}>👁 Voir</button>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/equipment/${e.id}/edit`)}>✏</button>
                <button className="btn btn-danger btn-sm"    onClick={() => setDeleteId(e.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteId && (
        <ConfirmModal message="Supprimer cet équipement ?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
      )}
    </div>
  )
}
