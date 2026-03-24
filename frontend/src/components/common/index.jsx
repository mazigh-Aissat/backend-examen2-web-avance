// ────────────────────────────────────────────────────────────
// Composants communs — réutilisés dans toutes les pages
// ────────────────────────────────────────────────────────────

// ── Spinner de chargement ─────────────────────────────────
export function LoadingScreen({ text = 'Chargement...' }) {
  return (
    <div className="loading-screen">
      <div className="spinner" style={{ width: 30, height: 30, borderWidth: 3 }} />
      <span style={{ fontSize: '0.855rem' }}>{text}</span>
    </div>
  )
}

// ── État vide ─────────────────────────────────────────────
export function EmptyState({ icon = '📭', title = 'Aucun résultat', text = '', action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {text && <p style={{ marginTop: 6 }}>{text}</p>}
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  )
}

// ── Alerte ────────────────────────────────────────────────
export function Alert({ type = 'error', children }) {
  const icon = type === 'error' ? '⚠' : '✓'
  return (
    <div className={`alert alert-${type}`}>
      <span>{icon}</span> {children}
    </div>
  )
}

// ── Modal de confirmation suppression ────────────────────
export function ConfirmModal({ message, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Confirmer la suppression</h3>
          <button className="btn-close" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text2)' }}>
            {message || 'Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.'}
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Annuler
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Image avec fallback ───────────────────────────────────
// Le backend stocke l'URL complète (http://localhost:5000/public/images/...)
export function CardImage({ src, alt, fallbackIcon = '🖼' }) {
  if (!src) return <div className="card-img-placeholder">{fallbackIcon}</div>
  return <img className="card-img" src={src} alt={alt} onError={e => { e.target.style.display='none'; e.target.nextSibling?.style && (e.target.nextSibling.style.display='flex') }} />
}

export function HeroImage({ src, alt, fallbackIcon = '🖼' }) {
  if (!src) return <div className="detail-hero-placeholder">{fallbackIcon}</div>
  return <img className="detail-hero-img" src={src} alt={alt} />
}

// ── Badges ────────────────────────────────────────────────
export function DomaineBadge({ domaine }) {
  const map = { sciences: 'badge-blue', literature: 'badge-purple', autre: 'badge-gray' }
  return <span className={`badge ${map[domaine] ?? 'badge-gray'}`}>{domaine}</span>
}

export function StatutBadge({ statut }) {
  return <span className={`badge ${statut === 'requis' ? 'badge-blue' : 'badge-yellow'}`}>{statut}</span>
}

export function ModeleBadge({ modele }) {
  const map = { nouveau: 'badge-green', ancien: 'badge-yellow', refait: 'badge-blue' }
  return <span className={`badge ${map[modele] ?? 'badge-gray'}`}>{modele}</span>
}

export function ConducteBadge({ conduite }) {
  const map = { excellente: 'badge-green', bonne: 'badge-blue', passable: 'badge-yellow' }
  return <span className={`badge ${map[conduite] ?? 'badge-gray'}`}>{conduite}</span>
}

export function RoleBadge({ titre }) {
  const colors = { admin: 'badge-red', prof: 'badge-purple', etudiant: 'badge-blue' }
  return <span className={`badge ${colors[titre?.toLowerCase()] ?? 'badge-gray'}`}>{titre}</span>
}
