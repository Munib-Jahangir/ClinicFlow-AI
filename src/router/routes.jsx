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
import AdminAppointments from '../pages/admin/Appointments';
import AdminAnalytics from '../pages/admin/Analytics';
import ReceptionistsList from '../pages/admin/Receptionists';

// Doctor Pages
import DoctorDashboard from '../pages/doctor/Dashboard';
import AISymptomChecker from '../pages/doctor/AIChecker';
import PrescriptionManager from '../pages/doctor/Prescriptions';
import DoctorAppointments from '../pages/doctor/Appointments';

// Receptionist Pages
import ReceptionistDashboard from '../pages/receptionist/Dashboard';

// Patient Pages
import PatientDashboard from '../pages/patient/Dashboard';
import PatientAIAssistant from '../pages/patient/AIAssistant';
import PatientHistory from '../pages/patient/History';
import PatientPrescriptions from '../pages/patient/Prescriptions';

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
          { path: '/admin/receptionists', element: <ReceptionistsList /> },
          { path: '/admin/patients', element: <PatientsList /> },
          { path: '/admin/appointments', element: <AdminAppointments /> },
          { path: '/admin/analytics', element: <AdminAnalytics /> },
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
          { path: '/doctor/appointments', element: <DoctorAppointments /> },
          { path: '/doctor/patients', element: <PatientsList /> },
          { path: '/doctor/ai-checker', element: <AISymptomChecker /> },
          { path: '/doctor/prescriptions', element: <PrescriptionManager /> },
          { path: '/doctor/analytics', element: <AdminAnalytics /> }, // Reusing AdminAnalytics or creating Dr specific
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
          { path: '/patient/history', element: <PatientHistory /> },
          { path: '/patient/prescriptions', element: <PatientPrescriptions /> },
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
