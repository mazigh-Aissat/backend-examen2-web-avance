# EduPortail — Programmation Web Avancé — Évaluation 2

Application web complète de gestion d'un portail académique.  
**Cours :** Programmation Web Avancé — La Cité  
**Date de remise :** 24 mars 2026

---

## 👥 Équipe & Répartition du travail

| Membre | Tables responsables | Pages créées |
|--------|-------------------|--------------|
| **Mazigh** | Users + Roles | UserList, UserForm, UserDetail (gestion rôles + photo + matières), RoleList |
| **Youba** | Departments + Subjects + Laboratories + Equipment | DepartmentList/Form/Detail, SubjectList/Form/Detail (inscription users), LaboratoryList/Form/Detail, EquipmentList/Form/Detail |

> L'équipe est composée de **2 personnes** (au lieu de 3).

---

## 🚀 Installation & démarrage

### 1. Backend
```bash
npm install
node index.js
# → http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## 🛠️ Technologies utilisées

| Technologie | Usage |
|-------------|-------|
| **React 18** | Interface (pas de Next.js ni framework) |
| **Redux Toolkit** | Gestion d'état global (auth) |
| **React Router v6** | Routage SPA + routes protégées |
| **Axios** | Appels API + intercepteurs token/401 |
| **React Hook Form + Yup** | Formulaires + validation |
| **Vite** | Build tool |

---

## ✅ Fonctionnalités

### CRUD complet
- ✅ Utilisateurs — avec mise à jour photo séparée
- ✅ Départements — avec liste users et matières
- ✅ Matières — avec inscription étudiants
- ✅ Laboratoires — avec équipements et matières
- ✅ Équipements
- ✅ Rôles (admin seulement)

### Relations many-to-many
- ✅ Assigner des rôles à un user
- ✅ Inscrire des users à une matière
- ✅ Inscrire un user à des matières

### Validation
- ✅ Messages d'erreur en rouge sous chaque champ
- ✅ Validation Yup sur tous les formulaires

### Authentification
- ✅ Token JWT dans localStorage
- ✅ Intercepteur Axios automatique
- ✅ ProtectedRoute + AdminRoute
- ✅ Déconnexion automatique si 401

---

## 🔐 Protection des routes

| Route | Protection |
|-------|-----------|
| `/login` | Publique |
| Toutes les autres | Token JWT requis |
| `/roles` | Token + rôle admin |
