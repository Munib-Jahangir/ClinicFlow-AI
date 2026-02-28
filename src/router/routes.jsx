import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/layout/Layout';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import NotAuthorized from '../pages/NotAuthorized';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import DoctorsList from '../pages/admin/Doctors';
import PatientsList from '../pages/admin/Patients';

// Doctor Pages
import DoctorDashboard from '../pages/doctor/Dashboard';
import AISymptomChecker from '../pages/doctor/AIChecker';
import PrescriptionManager from '../pages/doctor/Prescriptions';

// Receptionist Pages
import ReceptionistDashboard from '../pages/receptionist/Dashboard';

// Patient Pages
import PatientDashboard from '../pages/patient/Dashboard';
import PatientAIAssistant from '../pages/patient/AIAssistant';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/403',
    element: <NotAuthorized />,
  },
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/admin/dashboard', element: <AdminDashboard /> },
          { path: '/admin/doctors', element: <DoctorsList /> },
          { path: '/admin/patients', element: <PatientsList /> },
          { path: '/admin/appointments', element: <AdminDashboard /> },
          { path: '/admin/analytics', element: <AdminDashboard /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['doctor']} />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/doctor/dashboard', element: <DoctorDashboard /> },
          { path: '/doctor/appointments', element: <DoctorDashboard /> },
          { path: '/doctor/patients', element: <DoctorDashboard /> },
          { path: '/doctor/ai-checker', element: <AISymptomChecker /> },
          { path: '/doctor/prescriptions', element: <PrescriptionManager /> },
          { path: '/doctor/analytics', element: <DoctorDashboard /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['receptionist']} />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/receptionist/dashboard', element: <ReceptionistDashboard /> },
          { path: '/receptionist/appointments', element: <ReceptionistDashboard /> },
          { path: '/receptionist/patients', element: <PatientsList /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['patient']} />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/patient/dashboard', element: <PatientDashboard /> },
          { path: '/patient/appointments', element: <PatientDashboard /> },
          { path: '/patient/ai-assistant', element: <PatientAIAssistant /> },
          { path: '/patient/history', element: <PatientDashboard /> },
          { path: '/patient/prescriptions', element: <PatientDashboard /> },
          { path: '/patient/profile', element: <PatientDashboard /> },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

export default router;
