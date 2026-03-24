import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userService } from '../../services/api.js'
import {
  LoadingScreen, EmptyState, ConfirmModal, ConducteBadge
} from '../../components/common/index.jsx'

export default function UserList() {
  const navigate = useNavigate()
  const [users, setUsers]       = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async (searchVal = '') => {
    setLoading(true)
    try {
      const res = await userService.getAll({ search: searchVal, size: 50 })
      // Réponse : { data: { users: [], total, currentPage, totalPages } }
      const payload = res.data?.data
      setUsers(payload?.users ?? [])
      setTotal(payload?.total ?? 0)
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Recherche côté backend
  const handleSearch = (e) => {
    const val = e.target.value
    setSearch(val)
    load(val)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await userService.delete(deleteId)
      setDeleteId(null)
      load(search)
    } catch {} finally { setDeleting(false) }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Utilisateurs</h1>
          <p className="page-subtitle">{total} utilisateur{total !== 1 ? 's' : ''} au total</p>
        </div>
        <Link to="/users/new" className="btn btn-primary">➕ Ajouter</Link>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="form-control"
            placeholder="Rechercher par nom..."
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      {loading ? <LoadingScreen /> : users.length === 0 ? (
        <EmptyState
          icon="👥" title="Aucun utilisateur trouvé"
          action={<Link to="/users/new" className="btn btn-primary">➕ Ajouter</Link>}
        />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Photo</th>
                <th>Nom complet</th>
                <th>Email</th>
                <th>Conduite</th>
                <th>Département</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: 'var(--bg3)', overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem'
                    }}>
                      {u.photo
                        ? <img src={u.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : `${u.prenom?.[0] ?? ''}${u.nom?.[0] ?? ''}`.toUpperCase()}
                    </div>
                  </td>
                  <td className="td-main">{u.prenom} {u.nom}</td>
                  <td>{u.email}</td>
                  <td>{u.conduite ? <ConducteBadge conduite={u.conduite} /> : '—'}</td>
                  <td>{u.Department?.nom ?? '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/users/${u.id}`)}>👁</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/users/${u.id}/edit`)}>✏</button>
                      <button className="btn btn-danger btn-sm"    onClick={() => setDeleteId(u.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          message="Supprimer cet utilisateur définitivement ?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
