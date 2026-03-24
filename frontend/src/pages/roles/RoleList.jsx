import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { roleService } from '../../services/api.js'
import {
  LoadingScreen, EmptyState, ConfirmModal, Alert
} from '../../components/common/index.jsx'

const schema = yup.object({
  titre:       yup.string().required('Le titre du rôle est obligatoire'),
  description: yup.string().nullable(),
})

export default function RoleList() {
  const [roles,     setRoles]    = useState([])
  const [loading,   setLoading]  = useState(true)
  const [showForm,  setShowForm] = useState(false)
  const [deleteId,  setDeleteId] = useState(null)
  const [deleting,  setDeleting] = useState(false)
  const [error,     setError]    = useState('')
  const [success,   setSuccess]  = useState('')
  const [saving,    setSaving]   = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  })

  const load = async () => {
    setLoading(true)
    try {
      const res = await roleService.getAll()
      // roleList retourne { data: roles[] } — pas paginé
      setRoles(Array.isArray(res.data?.data) ? res.data.data : [])
    } catch {
      setRoles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onSubmit = async (data) => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await roleService.create(data)
      setSuccess('Rôle créé avec succès !')
      reset()
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erreur lors de la création')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await roleService.delete(deleteId)
      setDeleteId(null)
      load()
    } catch {} finally { setDeleting(false) }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Rôles</h1>
          <p className="page-subtitle">Administration — {roles.length} rôle{roles.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }}
        >
          {showForm ? '✕ Annuler' : '➕ Nouveau rôle'}
        </button>
      </div>

      {success && <Alert type="success">{success}</Alert>}

      {/* Formulaire de création inline */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <h3 style={{ marginBottom: 16 }}>Créer un nouveau rôle</h3>
            {error && <Alert type="error">{error}</Alert>}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Titre *</label>
                  <input
                    className={`form-control ${errors.titre ? 'is-invalid' : ''}`}
                    placeholder="ex: admin, prof, etudiant"
                    {...register('titre')}
                  />
                  {errors.titre && <p className="form-error">⚠ {errors.titre.message}</p>}
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Description</label>
                  <input className="form-control" placeholder="Description du rôle..." {...register('description')} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" /> Création...</> : '✓ Créer le rôle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <LoadingScreen /> : roles.length === 0 ? (
        <EmptyState icon="🛡" title="Aucun rôle" text="Créez des rôles pour contrôler les accès." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Titre</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(r => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--text3)' }}>{r.id}</td>
                  <td className="td-main">
                    <span className="badge badge-purple">{r.titre}</span>
                  </td>
                  <td>{r.description || '—'}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(r.id)}>
                      🗑 Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          message="Supprimer ce rôle ? Les utilisateurs ayant ce rôle perdront leurs permissions."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
