import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate, useParams } from 'react-router-dom'
import { laboratoryService, departmentService } from '../../services/api.js'
import { Alert, LoadingScreen } from '../../components/common/index.jsx'

const schema = yup.object({
  nom:          yup.string().required('Le nom du laboratoire est obligatoire'),
  salle:        yup.string().nullable(),
  information:  yup.string().nullable(),
  DepartmentId: yup.number().nullable().transform(v => (isNaN(v) ? null : v)),
})

export default function LaboratoryForm() {
  const { id }   = useParams()
  const isEdit   = !!id
  const navigate = useNavigate()

  const [departments,  setDepartments]  = useState([])
  const [initLoading,  setInitLoading]  = useState(isEdit)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    departmentService.getAll({ size: 100 })
      .then(r => setDepartments(r.data?.data?.departments ?? []))
      .catch(() => {})

    if (isEdit) {
      laboratoryService.getById(id)
        .then(r => {
          const l = r.data?.data
          reset({
            nom:          l.nom          ?? '',
            salle:        l.salle        ?? '',
            information:  l.information  ?? '',
            DepartmentId: l.DepartmentId ?? '',
          })
        })
        .catch(() => setError('Impossible de charger le laboratoire'))
        .finally(() => setInitLoading(false))
    }
  }, [id])

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      if (isEdit) {
        await laboratoryService.update(id, {
          nom: data.nom, salle: data.salle,
          information: data.information,
          DepartmentId: data.DepartmentId || null,
        })
      } else {
        const fd = new FormData()
        fd.append('nom', data.nom)
        if (data.salle)        fd.append('salle',        data.salle)
        if (data.information)  fd.append('information',  data.information)
        if (data.DepartmentId) fd.append('DepartmentId', data.DepartmentId)
        if (data.image?.[0])   fd.append('image',        data.image[0])
        await laboratoryService.create(fd)
      }
      setSuccess(isEdit ? 'Laboratoire mis à jour !' : 'Laboratoire créé avec succès !')
      setTimeout(() => navigate('/laboratories'), 1400)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  if (initLoading) return <LoadingScreen />

  return (
    <div className="fade-in" style={{ maxWidth: 600 }}>
      <div className="page-header">
        <div>
          <h1>{isEdit ? 'Modifier le laboratoire' : 'Créer un laboratoire'}</h1>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/laboratories')}>← Retour</button>
      </div>

      <div className="card">
        <div className="card-body">
          {error   && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div className="form-group">
                <label className="form-label">Nom du laboratoire *</label>
                <input className={`form-control ${errors.nom ? 'is-invalid' : ''}`} placeholder="Labo de chimie" {...register('nom')} />
                {errors.nom && <p className="form-error">⚠ {errors.nom.message}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Salle</label>
                <input className="form-control" placeholder="ex: B-204" {...register('salle')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Département</label>
              <select className="form-control" {...register('DepartmentId')}>
                <option value="">— Aucun département —</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Informations</label>
              <textarea className="form-control" rows={4} placeholder="Description du laboratoire..." {...register('information')} />
            </div>

            {!isEdit && (
              <div className="form-group">
                <label className="form-label">Image</label>
                <label className="img-upload-area">
                  <input type="file" accept="image/*" style={{ display: 'none' }} {...register('image')} />
                  📁 Cliquer pour choisir une image (optionnel)
                </label>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/laboratories')}>Annuler</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner" /> Enregistrement...</> : isEdit ? '💾 Mettre à jour' : '✓ Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
