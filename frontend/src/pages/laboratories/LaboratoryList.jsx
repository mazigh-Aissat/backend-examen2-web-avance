import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { laboratoryService } from '../../services/api.js'
import {
  LoadingScreen, EmptyState, ConfirmModal, CardImage
} from '../../components/common/index.jsx'

export default function LaboratoryList() {
  const navigate = useNavigate()
  const [items,    setItems]    = useState([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async (searchVal = '') => {
    setLoading(true)
    try {
      const res = await laboratoryService.getAll({ search: searchVal, size: 50 })
      // { data: { laboratories: [], total } }
      const payload = res.data?.data
      setItems(payload?.laboratories ?? [])
      setTotal(payload?.total ?? 0)
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
      await laboratoryService.delete(deleteId)
      setDeleteId(null)
      load(search)
    } catch {} finally { setDeleting(false) }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Laboratoires</h1>
          <p className="page-subtitle">{total} laboratoire{total !== 1 ? 's' : ''} au total</p>
        </div>
        <Link to="/laboratories/new" className="btn btn-primary">➕ Ajouter</Link>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="form-control" placeholder="Rechercher..." value={search} onChange={handleSearch} />
        </div>
      </div>

      {loading ? <LoadingScreen /> : items.length === 0 ? (
        <EmptyState icon="🔬" title="Aucun laboratoire trouvé" action={<Link to="/laboratories/new" className="btn btn-primary">➕ Ajouter</Link>} />
      ) : (
        <div className="grid grid-3">
          {items.map(l => (
            <div key={l.id} className="card">
              <CardImage src={l.image} alt={l.nom} fallbackIcon="🔬" />
              <div className="card-body">
                <div className="card-title">{l.nom}</div>
                {l.salle && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text3)', margin: '4px 0' }}>📍 Salle {l.salle}</div>
                )}
                {l.information && (
                  <p className="card-text" style={{
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden', marginTop: 4
                  }}>{l.information}</p>
                )}
              </div>
              <div className="card-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/laboratories/${l.id}`)}>👁 Voir</button>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/laboratories/${l.id}/edit`)}>✏</button>
                <button className="btn btn-danger btn-sm"    onClick={() => setDeleteId(l.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteId && (
        <ConfirmModal message="Supprimer ce laboratoire ?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
      )}
    </div>
  )
}
