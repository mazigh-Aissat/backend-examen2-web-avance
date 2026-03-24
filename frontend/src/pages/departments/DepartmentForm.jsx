import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate, useParams } from 'react-router-dom'
import { departmentService } from '../../services/api.js'
import { Alert, LoadingScreen } from '../../components/common/index.jsx'

const schema = yup.object({
  nom:      yup.string().required('Le nom du département est obligatoire'),
  domaine:  yup.string()
    .oneOf(['sciences', 'literature', 'autre'], 'Choisissez un domaine valide')
    .required('Le domaine est obligatoire'),
  histoire: yup.string().nullable(),
})

export default function DepartmentForm() {
  const { id }   = useParams()
  const isEdit   = !!id
  const navigate = useNavigate()

  const [initLoading, setInitLoading] = useState(isEdit)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { domaine: '' },
  })

  useEffect(() => {
    if (isEdit) {
      departmentService.getById(id)
        .then(r => {
          const d = r.data?.data
          reset({ nom: d.nom, domaine: d.domaine, histoire: d.histoire ?? '' })
        })
        .catch(() => setError('Impossible de charger le département'))
        .finally(() => setInitLoading(false))
    }
  }, [id])

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      if (isEdit) {
        // PUT — JSON sans image
        await departmentService.update(id, { nom: data.nom, domaine: data.domaine, histoire: data.histoire })
      } else {
        // POST — FormData avec image possible
        const fd = new FormData()
        fd.append('nom',     data.nom)
        fd.append('domaine', data.domaine)
        if (data.histoire) fd.append('histoire', data.histoire)
        if (data.image?.[0]) fd.append('image',  data.image[0])
        await departmentService.create(fd)
      }
      setSuccess(isEdit ? 'Département mis à jour !' : 'Département créé avec succès !')
      setTimeout(() => navigate('/departments'), 1400)
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
          <h1>{isEdit ? 'Modifier le département' : 'Créer un département'}</h1>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/departments')}>← Retour</button>
      </div>

      <div className="card">
        <div className="card-body">
          {error   && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            <div className="form-group">
              <label className="form-label">Nom du département *</label>
              <input
                className={`form-control ${errors.nom ? 'is-invalid' : ''}`}
                placeholder="ex: Sciences informatiques"
                {...register('nom')}
              />
              {errors.nom && <p className="form-error">⚠ {errors.nom.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Domaine *</label>
              <select className={`form-control ${errors.domaine ? 'is-invalid' : ''}`} {...register('domaine')}>
                <option value="">— Choisir un domaine —</option>
                <option value="sciences">Sciences</option>
                <option value="literature">Littérature</option>
                <option value="autre">Autre</option>
              </select>
              {errors.domaine && <p className="form-error">⚠ {errors.domaine.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Histoire / Description</label>
              <textarea className="form-control" rows={4} placeholder="Décrivez le département..." {...register('histoire')} />
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
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/departments')}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading
                  ? <><span className="spinner" /> Enregistrement...</>
                  : isEdit ? '💾 Mettre à jour' : '✓ Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
