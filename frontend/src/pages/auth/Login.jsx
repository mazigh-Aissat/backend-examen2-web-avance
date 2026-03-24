import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Navigate } from 'react-router-dom'
import { loginSuccess, selectIsAuth } from '../../store/authSlice.js'
import { authService, userService } from '../../services/api.js'

const schema = yup.object({
  email:        yup.string().email('Adresse email invalide').required("L'email est requis"),
  mot_de_passe: yup.string().min(4, 'Minimum 4 caractères').required('Le mot de passe est requis'),
})

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isAuth   = useSelector(selectIsAuth)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading]         = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  })

  if (isAuth) return <Navigate to="/" replace />

  const onSubmit = async (credentials) => {
    setLoading(true)
    setServerError('')
    try {
      const res = await authService.login(credentials)
      const { data: user, token } = res.data
      let userAvecRoles = user
      try {
        const userRes = await userService.getById(user.id)
        userAvecRoles = userRes.data?.data ?? user
      } catch {}
      dispatch(loginSuccess({ user: userAvecRoles, token }))
      navigate('/')
    } catch (err) {
      setServerError(err.response?.data?.message || 'Email ou mot de passe incorrect')
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
          <p>Connectez-vous à votre espace académique</p>
        </div>

        {serverError && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            ⚠ {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Adresse email</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="votre@email.com"
              {...register('email')}
            />
            {errors.email && <p className="form-error">⚠ {errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
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
            {loading ? <><span className="spinner" /> Connexion...</> : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 22, color: 'var(--text3)', fontSize: '0.82rem' }}>
          Pas encore de compte ?{' '}
          <a href="/register">Créer un compte</a>
        </p>
      </div>
    </div>
  )
}