import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate, Link } from 'react-router-dom'
import { userService } from '../../services/api.js'

const schema = yup.object({
  prenom:       yup.string().required('Le prénom est obligatoire'),
  nom:          yup.string().nullable(),
  email:        yup.string().email('Format email invalide').required("L'email est obligatoire"),
  mot_de_passe: yup.string().min(6, 'Minimum 6 caractères').required('Le mot de passe est obligatoire'),
})

export default function Register() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [loading, setLoading]         = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setServerError('')
    try {
      const fd = new FormData()
      fd.append('prenom',       data.prenom)
      fd.append('email',        data.email)
      fd.append('mot_de_passe', data.mot_de_passe)
      if (data.nom) fd.append('nom', data.nom)
      await userService.create(fd)
      navigate('/login')
    } catch (err) {
      setServerError(err.response?.data?.message || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-glow1" />
      <div className="auth-glow2" />

      <div className="auth-card">
        <div className="auth-logo">
          <h1>EduPortail</h1>
          <p>Créer votre compte</p>
        </div>

        {serverError && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            ⚠ {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
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
              <input className="form-control" placeholder="Dupont" {...register('nom')} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Adresse email *</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="votre@email.com"
              {...register('email')}
            />
            {errors.email && <p className="form-error">⚠ {errors.email.message}</p>}
          </div>

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

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '11px' }}
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Création...</> : 'Créer mon compte'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 22, color: 'var(--text3)', fontSize: '0.82rem' }}>
          Déjà un compte ?{' '}
          <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}