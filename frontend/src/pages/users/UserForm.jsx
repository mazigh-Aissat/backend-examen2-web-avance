import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate, useParams } from 'react-router-dom'
import { userService, departmentService } from '../../services/api.js'
import { Alert, LoadingScreen } from '../../components/common/index.jsx'

// ── Schéma de validation Yup ──────────────────────────────
const schemaCreate = yup.object({
  prenom:       yup.string().required('Le prénom est obligatoire'),
  nom:          yup.string().nullable(),
  email:        yup.string().email('Format email invalide').required('L\'email est obligatoire'),
  mot_de_passe: yup.string().min(6, 'Minimum 6 caractères').required('Le mot de passe est obligatoire'),
  naissance:    yup.string().nullable(),
  biographie:   yup.string().nullable(),
  conduite:     yup.string().oneOf(['excellente', 'bonne', 'passable', ''], 'Valeur invalide').nullable(),
  DepartmentId: yup.number().nullable().transform(v => (isNaN(v) ? null : v)),
})

const schemaEdit = yup.object({
  prenom:       yup.string().required('Le prénom est obligatoire'),
  nom:          yup.string().nullable(),
  email:        yup.string().email('Format email invalide').required('L\'email est obligatoire'),
  naissance:    yup.string().nullable(),
  biographie:   yup.string().nullable(),
  conduite:     yup.string().oneOf(['excellente', 'bonne', 'passable', ''], 'Valeur invalide').nullable(),
  DepartmentId: yup.number().nullable().transform(v => (isNaN(v) ? null : v)),
})

export default function UserForm() {
  const { id }   = useParams()
  const isEdit   = !!id
  const navigate = useNavigate()
  const isRegister = window.location.pathname === '/register'

  const [departments, setDepartments] = useState([])
  const [initLoading, setInitLoading] = useState(isEdit)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(isEdit ? schemaEdit : schemaCreate),
  })

  useEffect(() => {
    // Charger les départements
    departmentService.getAll({ size: 100 })
      .then(r => setDepartments(r.data?.data?.departments ?? []))
      .catch(() => {})

    // Pré-remplir si édition
    if (isEdit) {
      userService.getById(id)
        .then(r => {
          const u = r.data?.data
          reset({
            prenom:       u.prenom       ?? '',
            nom:          u.nom          ?? '',
            email:        u.email        ?? '',
            naissance:    u.naissance    ?? '',
            biographie:   u.biographie   ?? '',
            conduite:     u.conduite     ?? '',
            DepartmentId: u.DepartmentId ?? '',
          })
        })
        .catch(() => setError('Impossible de charger l\'utilisateur'))
        .finally(() => setInitLoading(false))
    }
  }, [id])

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      if (isEdit) {
        // PUT envoie JSON (sans photo — photo séparée)
        const { photo, ...dataWithoutPhoto } = data
        await userService.update(id, dataWithoutPhoto)
      } else {
        // POST envoie FormData (avec photo possible)
        const fd = new FormData()
        fd.append('prenom',   data.prenom)
        fd.append('email',    data.email)
        fd.append('mot_de_passe', data.mot_de_passe)
        if (data.nom)          fd.append('nom',          data.nom)
        if (data.naissance)    fd.append('naissance',    data.naissance)
        if (data.biographie)   fd.append('biographie',   data.biographie)
        if (data.conduite)     fd.append('conduite',     data.conduite)
        if (data.DepartmentId) fd.append('DepartmentId', data.DepartmentId)
        if (data.photo?.[0])   fd.append('photo',        data.photo[0])
        await userService.create(fd)
      }
      setSuccess(isEdit ? 'Utilisateur mis à jour avec succès !' : 'Utilisateur créé avec succès !')
      setTimeout(() => navigate(isRegister ? '/login' : '/users'), 1400)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Une erreur est survenue, veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  if (initLoading) return <LoadingScreen />

  return (
    <div className="fade-in" style={{ maxWidth: 620 }}>
      <div className="page-header">
        <div>
          <h1>{isEdit ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}</h1>
          <p className="page-subtitle">{isEdit ? 'Mettre à jour les informations' : 'Remplir le formulaire ci-dessous'}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/users')}>← Retour</button>
      </div>

      <div className="card">
        <div className="card-body">
          {error   && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* Prénom / Nom */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div className="form-group">
                <label className="form-label">Prénom *</label>
                <input
                  className={`form-control ${errors.prenom ? 'is-invalid' : ''}`}
                  placeholder="Jean"
                  {...register('prenom')}
                />
                {errors.prenom && <p className="form-error">⚠ {errors.prenom.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Nom</label>
                <input
                  className="form-control"
                  placeholder="Dupont"
                  {...register('nom')}
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Adresse email *</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="jean.dupont@email.com"
                {...register('email')}
              />
              {errors.email && <p className="form-error">⚠ {errors.email.message}</p>}
            </div>

            {/* Mot de passe — création seulement */}
            {!isEdit && (
              <div className="form-group">
                <label className="form-label">Mot de passe *</label>
                <input
                  type="password"
                  className={`form-control ${errors.mot_de_passe ? 'is-invalid' : ''}`}
                  placeholder="••••••••"
                  {...register('mot_de_passe')}
                />
                {errors.mot_de_passe && <p className="form-error">⚠ {errors.mot_de_passe.message}</p>}
              </div>
            )}

            {/* Naissance / Conduite */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div className="form-group">
                <label className="form-label">Date de naissance</label>
                <input type="date" className="form-control" {...register('naissance')} />
              </div>

              <div className="form-group">
                <label className="form-label">Conduite</label>
                <select className={`form-control ${errors.conduite ? 'is-invalid' : ''}`} {...register('conduite')}>
                  <option value="">— Choisir —</option>
                  <option value="excellente">Excellente</option>
                  <option value="bonne">Bonne</option>
                  <option value="passable">Passable</option>
                </select>
                {errors.conduite && <p className="form-error">⚠ {errors.conduite.message}</p>}
              </div>
            </div>

            {/* Département */}
            <div className="form-group">
              <label className="form-label">Département</label>
              <select className="form-control" {...register('DepartmentId')}>
                <option value="">— Aucun département —</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.nom}</option>
                ))}
              </select>
            </div>

            {/* Biographie */}
            <div className="form-group">
              <label className="form-label">Biographie</label>
              <textarea className="form-control" rows={3} placeholder="Quelques mots..." {...register('biographie')} />
            </div>

            {/* Photo — création seulement */}
            {!isEdit && (
              <div className="form-group">
                <label className="form-label">Photo de profil</label>
                <label className="img-upload-area">
                  <input type="file" accept="image/*" style={{ display: 'none' }} {...register('photo')} />
                  📁 Cliquer pour choisir une photo (optionnel)
                </label>
              </div>
            )}

            {/* Boutons */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/users')}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading
                  ? <><span className="spinner" /> Enregistrement...</>
                  : isEdit ? '💾 Mettre à jour' : '✓ Créer l\'utilisateur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
