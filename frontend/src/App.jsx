import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import AdminRoute from './components/common/AdminRoute.jsx'

import Login         from './pages/auth/Login.jsx'
import Register      from './pages/auth/Register.jsx'
import Dashboard     from './pages/Dashboard.jsx'

import UserList      from './pages/users/UserList.jsx'
import UserDetail    from './pages/users/UserDetail.jsx'
import UserForm      from './pages/users/UserForm.jsx'

import DepartmentList   from './pages/departments/DepartmentList.jsx'
import DepartmentDetail from './pages/departments/DepartmentDetail.jsx'
import DepartmentForm   from './pages/departments/DepartmentForm.jsx'

import SubjectList      from './pages/subjects/SubjectList.jsx'
import SubjectDetail    from './pages/subjects/SubjectDetail.jsx'
import SubjectForm      from './pages/subjects/SubjectForm.jsx'

import LaboratoryList      from './pages/laboratories/LaboratoryList.jsx'
import LaboratoryDetail    from './pages/laboratories/LaboratoryDetail.jsx'
import LaboratoryForm      from './pages/laboratories/LaboratoryForm.jsx'

import EquipmentList      from './pages/equipment/EquipmentList.jsx'
import EquipmentDetail    from './pages/equipment/EquipmentDetail.jsx'
import EquipmentForm      from './pages/equipment/EquipmentForm.jsx'

import RoleList from './pages/roles/RoleList.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes protégées */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />

            <Route path="/users"          element={<UserList />} />
            <Route path="/users/new"      element={<UserForm />} />
            <Route path="/users/:id"      element={<UserDetail />} />
            <Route path="/users/:id/edit" element={<UserForm />} />

            <Route path="/departments"          element={<DepartmentList />} />
            <Route path="/departments/new"      element={<DepartmentForm />} />
            <Route path="/departments/:id"      element={<DepartmentDetail />} />
            <Route path="/departments/:id/edit" element={<DepartmentForm />} />

            <Route path="/subjects"          element={<SubjectList />} />
            <Route path="/subjects/new"      element={<SubjectForm />} />
            <Route path="/subjects/:id"      element={<SubjectDetail />} />
            <Route path="/subjects/:id/edit" element={<SubjectForm />} />

            <Route path="/laboratories"          element={<LaboratoryList />} />
            <Route path="/laboratories/new"      element={<LaboratoryForm />} />
            <Route path="/laboratories/:id"      element={<LaboratoryDetail />} />
            <Route path="/laboratories/:id/edit" element={<LaboratoryForm />} />

            <Route path="/equipment"          element={<EquipmentList />} />
            <Route path="/equipment/new"      element={<EquipmentForm />} />
            <Route path="/equipment/:id"      element={<EquipmentDetail />} />
            <Route path="/equipment/:id/edit" element={<EquipmentForm />} />

            <Route element={<AdminRoute />}>
              <Route path="/roles" element={<RoleList />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}