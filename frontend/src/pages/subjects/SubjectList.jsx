import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { subjectService } from '../../services/api.js'
import {
  LoadingScreen, EmptyState, ConfirmModal, StatutBadge, CardImage
} from '../../components/common/index.jsx'

export default function SubjectList() {
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
      const res = await subjectService.getAll({ search: searchVal, size: 50 })
      // { data: { subjects: [], total } }
      const payload = res.data?.data
      setItems(payload?.subjects ?? [])
      setTotal(payload?.total    ?? 0)
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
      await subjectService.delete(deleteId)
      setDeleteId(null)
      load(search)
    } catch {} finally { setDeleting(false) }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Matières</h1>
          <p className="page-subtitle">{total} matière{total !== 1 ? 's' : ''} au total</p>
        </div>
        <Link to="/subjects/new" className="btn btn-primary">➕ Ajouter</Link>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="form-control" placeholder="Rechercher par nom..." value={search} onChange={handleSearch} />
        </div>
      </div>

      {loading ? <LoadingScreen /> : items.length === 0 ? (
        <EmptyState icon="📚" title="Aucune matière trouvée" action={<Link to="/subjects/new" className="btn btn-primary">➕ Ajouter</Link>} />
      ) : (
        <div className="grid grid-3">
          {items.map(s => (
            <div key={s.id} className="card">
              <CardImage src={s.image} alt={s.nom} fallbackIcon="📚" />
              <div className="card-body">
                <div className="card-title">{s.nom}</div>
                <div style={{ display: 'flex', gap: 6, margin: '5px 0', flexWrap: 'wrap' }}>
                  <span className="badge badge-gray">{s.code}</span>
                  {s.statut && <StatutBadge statut={s.statut} />}
                </div>
                {s.description && (
                  <p className="card-text" style={{
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>{s.description}</p>
                )}
              </div>
              <div className="card-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/subjects/${s.id}`)}>👁 Voir</button>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/subjects/${s.id}/edit`)}>✏</button>
                <button className="btn btn-danger btn-sm"    onClick={() => setDeleteId(s.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteId && (
        <ConfirmModal message="Supprimer cette matière ?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
      )}
    </div>
  )
}
