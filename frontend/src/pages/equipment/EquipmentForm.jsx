import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate, useParams } from 'react-router-dom'
import { equipmentService, laboratoryService } from '../../services/api.js'
import { Alert, LoadingScreen } from '../../components/common/index.jsx'

const schema = yup.object({
  nom:          yup.string().required('Le nom de l\'équipement est obligatoire'),
  modele:       yup.string()
    .oneOf(['nouveau', 'ancien', 'refait'], 'Choisissez un modèle valide')
    .required('Le modèle est obligatoire'),
  description:  yup.string().nullable(),
  LaboratoryId: yup.number().nullable().transform(v => (isNaN(v) ? null : v)),
})

export default function EquipmentForm() {
  const { id }   = useParams()
  const isEdit   = !!id
  const navigate = useNavigate()

  const [labs,        setLabs]        = useState([])
  const [initLoading, setInitLoading] = useState(isEdit)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { modele: '' },
  })

  useEffect(() => {
    laboratoryService.getAll({ size: 100 })
      .then(r => setLabs(r.data?.data?.laboratories ?? []))
      .catch(() => {})

    if (isEdit) {
      equipmentService.getById(id)
        .then(r => {
          const e = r.data?.data
          reset({
            nom:          e.nom          ?? '',
            modele:       e.modele       ?? '',
            description:  e.description  ?? '',
            LaboratoryId: e.LaboratoryId ?? '',
          })
        })
        .catch(() => setError('Impossible de charger l\'équipement'))
        .finally(() => setInitLoading(false))
    }
  }, [id])

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      if (isEdit) {
        await equipmentService.update(id, {
          nom: data.nom, modele: data.modele,
          description: data.description,
          LaboratoryId: data.LaboratoryId || null,
        })
      } else {
        const fd = new FormData()
        fd.append('nom',    data.nom)
        fd.append('modele', data.modele)
        if (data.description)  fd.append('description',  data.description)
        if (data.LaboratoryId) fd.append('LaboratoryId', data.LaboratoryId)
        if (data.image?.[0])   fd.append('image',        data.image[0])
        await equipmentService.create(fd)
      }
      setSuccess(isEdit ? 'Équipement mis à jour !' : 'Équipement créé avec succès !')
      setTimeout(() => navigate('/equipment'), 1400)
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
          <h1>{isEdit ? 'Modifier l\'équipement' : 'Créer un équipement'}</h1>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/equipment')}>← Retour</button>
      </div>

      <div className="card">
        <div className="card-body">
          {error   && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            <div className="form-group">
              <label className="form-label">Nom de l'équipement *</label>
              <input className={`form-control ${errors.nom ? 'is-invalid' : ''}`} placeholder="Microscope électronique" {...register('nom')} />
              {errors.nom && <p className="form-error">⚠ {errors.nom.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Modèle *</label>
              <select className={`form-control ${errors.modele ? 'is-invalid' : ''}`} {...register('modele')}>
                <option value="">— Choisir un modèle —</option>
                <option value="nouveau">Nouveau</option>
                <option value="ancien">Ancien</option>
                <option value="refait">Refait</option>
              </select>
              {errors.modele && <p className="form-error">⚠ {errors.modele.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Laboratoire</label>
              <select className="form-control" {...register('LaboratoryId')}>
                <option value="">— Aucun laboratoire —</option>
                {labs.map(l => <option key={l.id} value={l.id}>{l.nom}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={3} placeholder="Description de l'équipement..." {...register('description')} />
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
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/equipment')}>Annuler</button>
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
