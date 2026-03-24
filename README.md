# EduPortail — Programmation Web Avancé

Application web de gestion académique développée avec React (frontend) et Node.js/Express (backend).

## 👥 Équipe

| Membre | Tâches |
|--------|--------|
| **Mazigh Aissat** | Users, Departments, Structure de base (Redux, Auth, Routing) |
| **Brady** | Subjects, Laboratories |
| **Youba** | Equipment, Roles |

## 🛠️ Technologies utilisées

**Frontend**
- React 18
- Redux Toolkit
- React Router DOM
- React Hook Form + Yup
- Axios

**Backend**
- Node.js / Express
- Sequelize + SQLite
- JWT (authentification)
- Bcrypt

## 🚀 Installation et démarrage

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📋 Fonctionnalités

- ✅ Authentification avec JWT
- ✅ Protection des routes (ProtectedRoute + AdminRoute)
- ✅ CRUD complet : Users, Departments, Subjects, Laboratories, Equipment, Roles
- ✅ Gestion des relations (Users ↔ Roles, Users ↔ Subjects)
- ✅ Validation des formulaires avec messages d'erreur
- ✅ Interface responsive dark theme
- ✅ Gestion d'état avec Redux

## 🔗 Routes API

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/login | Connexion |
| GET/POST/PUT/DELETE | /api/users | Gestion utilisateurs |
| GET/POST/PUT/DELETE | /api/departments | Gestion départements |
| GET/POST/PUT/DELETE | /api/subjects | Gestion matières |
| GET/POST/PUT/DELETE | /api/laboratories | Gestion laboratoires |
| GET/POST/PUT/DELETE | /api/equipment | Gestion équipements |
| GET/POST/PUT/DELETE | /api/roles | Gestion rôles |
