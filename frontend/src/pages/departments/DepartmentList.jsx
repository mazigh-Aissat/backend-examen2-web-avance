import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { departmentService } from '../../services/api.js'
import {
  LoadingScreen, EmptyState, ConfirmModal, DomaineBadge, CardImage
} from '../../components/common/index.jsx'

export default function DepartmentList() {
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
      const res = await departmentService.getAll({ search: searchVal, size: 50 })
      // { data: { departments: [], total, currentPage, totalPages } }
      const payload = res.data?.data
      setItems(payload?.departments ?? [])
      setTotal(payload?.total ?? 0)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSearch = (e) => {
    const val = e.target.value
    setSearch(val)
    load(val)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await departmentService.delete(deleteId)
      setDeleteId(null)
      load(search)
    } catch {} finally { setDeleting(false) }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Départements</h1>
          <p className="page-subtitle">{total} département{total !== 1 ? 's' : ''} au total</p>
        </div>
        <Link to="/departments/new" className="btn btn-primary">➕ Ajouter</Link>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="form-control"
            placeholder="Rechercher..."
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      {loading ? <LoadingScreen /> : items.length === 0 ? (
        <EmptyState
          icon="🏛" title="Aucun département trouvé"
          action={<Link to="/departments/new" className="btn btn-primary">➕ Ajouter</Link>}
        />
      ) : (
        <div className="grid grid-3">
          {items.map(d => (
            <div key={d.id} className="card">
              <CardImage src={d.image} alt={d.nom} fallbackIcon="🏛" />
              <div className="card-body">
                <div className="card-title">{d.nom}</div>
                <div style={{ margin: '6px 0' }}>
                  <DomaineBadge domaine={d.domaine} />
                </div>
                {d.histoire && (
                  <p className="card-text" style={{
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>{d.histoire}</p>
                )}
              </div>
              <div className="card-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/departments/${d.id}`)}>👁 Voir</button>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/departments/${d.id}/edit`)}>✏</button>
                <button className="btn btn-danger btn-sm"    onClick={() => setDeleteId(d.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          message="Supprimer ce département ? Les utilisateurs et matières liés ne seront pas supprimés."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
