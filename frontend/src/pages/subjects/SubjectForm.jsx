import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate, useParams } from 'react-router-dom'
import { subjectService, departmentService, laboratoryService } from '../../services/api.js'
import { Alert, LoadingScreen } from '../../components/common/index.jsx'

const schema = yup.object({
  nom:          yup.string().required('Le nom de la matière est obligatoire'),
  code:         yup.string().required('Le code est obligatoire'),
  statut:       yup.string().oneOf(['requis', 'optionnel', ''], 'Valeur invalide').nullable(),
  description:  yup.string().nullable(),
  DepartmentId: yup.number().nullable().transform(v => (isNaN(v) ? null : v)),
  LaboratoryId: yup.number().nullable().transform(v => (isNaN(v) ? null : v)),
})

export default function SubjectForm() {
  const { id }   = useParams()
  const isEdit   = !!id
  const navigate = useNavigate()

  const [departments,  setDepartments]  = useState([])
  const [labs,         setLabs]         = useState([])
  const [initLoading,  setInitLoading]  = useState(isEdit)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { statut: '' },
  })

  useEffect(() => {
    // Charger listes pour les selects
    departmentService.getAll({ size: 100 })
      .then(r => setDepartments(r.data?.data?.departments ?? []))
      .catch(() => {})
    laboratoryService.getAll({ size: 100 })
      .then(r => setLabs(r.data?.data?.laboratories ?? []))
      .catch(() => {})

    if (isEdit) {
      subjectService.getById(id)
        .then(r => {
          const s = r.data?.data
          reset({
            nom:          s.nom          ?? '',
            code:         s.code         ?? '',
            statut:       s.statut       ?? '',
            description:  s.description  ?? '',
            DepartmentId: s.DepartmentId ?? '',
            LaboratoryId: s.LaboratoryId ?? '',
          })
        })
        .catch(() => setError('Impossible de charger la matière'))
        .finally(() => setInitLoading(false))
    }
  }, [id])

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      if (isEdit) {
        await subjectService.update(id, {
          nom: data.nom, code: data.code, statut: data.statut,
          description: data.description,
          DepartmentId: data.DepartmentId || null,
          LaboratoryId: data.LaboratoryId || null,
        })
      } else {
        const fd = new FormData()
        fd.append('nom',  data.nom)
        fd.append('code', data.code)
        if (data.statut)       fd.append('statut',       data.statut)
        if (data.description)  fd.append('description',  data.description)
        if (data.DepartmentId) fd.append('DepartmentId', data.DepartmentId)
        if (data.LaboratoryId) fd.append('LaboratoryId', data.LaboratoryId)
        if (data.image?.[0])   fd.append('image',        data.image[0])
        await subjectService.create(fd)
      }
      setSuccess(isEdit ? 'Matière mise à jour !' : 'Matière créée avec succès !')
      setTimeout(() => navigate('/subjects'), 1400)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  if (initLoading) return <LoadingScreen />

  return (
    <div className="fade-in" style={{ maxWidth: 620 }}>
      <div className="page-header">
        <div>
          <h1>{isEdit ? 'Modifier la matière' : 'Créer une matière'}</h1>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/subjects')}>← Retour</button>
      </div>

      <div className="card">
        <div className="card-body">
          {error   && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div className="form-group">
                <label className="form-label">Nom de la matière *</label>
                <input className={`form-control ${errors.nom ? 'is-invalid' : ''}`} placeholder="Algèbre" {...register('nom')} />
                {errors.nom && <p className="form-error">⚠ {errors.nom.message}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Code *</label>
                <input className={`form-control ${errors.code ? 'is-invalid' : ''}`} placeholder="MAT101" {...register('code')} />
                {errors.code && <p className="form-error">⚠ {errors.code.message}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Statut</label>
              <select className={`form-control ${errors.statut ? 'is-invalid' : ''}`} {...register('statut')}>
                <option value="">— Choisir —</option>
                <option value="requis">Requis</option>
                <option value="optionnel">Optionnel</option>
              </select>
              {errors.statut && <p className="form-error">⚠ {errors.statut.message}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div className="form-group">
                <label className="form-label">Département</label>
                <select className="form-control" {...register('DepartmentId')}>
                  <option value="">— Aucun —</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Laboratoire</label>
                <select className="form-control" {...register('LaboratoryId')}>
                  <option value="">— Aucun —</option>
                  {labs.map(l => <option key={l.id} value={l.id}>{l.nom}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={3} placeholder="Description de la matière..." {...register('description')} />
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
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/subjects')}>Annuler</button>
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
