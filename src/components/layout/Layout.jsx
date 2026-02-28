import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Activity,
  Brain,
  User,
  LogOut,
  Menu,
  X,
  Stethoscope,
  ChevronLeft,
  Clock,
  Settings,
  PieChart,
  ClipboardList,
  ShieldCheck,
} from 'lucide-react';
import AIChatWidget from '../common/AIChatWidget';

const roleNavItems = {
  admin: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
    { path: '/admin/receptionists', label: 'Staff', icon: ShieldCheck },
    { path: '/admin/appointments', label: 'Appointments', icon: Calendar },
    { path: '/admin/analytics', label: 'Analytics', icon: PieChart },
  ],
  doctor: [
    { path: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/doctor/appointments', label: 'Appointments', icon: Calendar },
    { path: '/doctor/patients', label: 'Patients', icon: Users },
    { path: '/doctor/ai-checker', label: 'AI Checker', icon: Brain },
    { path: '/doctor/prescriptions', label: 'Prescriptions', icon: FileText },
    { path: '/doctor/analytics', label: 'Analytics', icon: Activity },
  ],
  receptionist: [
    { path: '/receptionist/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/receptionist/appointments', label: 'Appointments', icon: Calendar },
    { path: '/receptionist/patients', label: 'Patients', icon: Users },
  ],
  patient: [
    { path: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/patient/appointments', label: 'Appointments', icon: Calendar },
    { path: '/patient/ai-assistant', label: 'AI Assistant', icon: Brain },
    { path: '/patient/history', label: 'Medical History', icon: ClipboardList },
    { path: '/patient/prescriptions', label: 'Prescriptions', icon: FileText },
    { path: '/patient/profile', label: 'Profile', icon: User },
  ],
};

const roleLabels = {
  admin: 'Administrator',
  doctor: 'Doctor',
  receptionist: 'Receptionist',
  patient: 'Patient',
};

const roleColors = {
  admin: 'bg-purple-100 text-purple-700',
  doctor: 'bg-medical-100 text-medical-700',
  receptionist: 'bg-amber-100 text-amber-700',
  patient: 'bg-primary-100 text-primary-700',
};

const Layout = ({ children }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = roleNavItems[user?.role] || [];
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 bg-white rounded-lg shadow-lg text-gray-600 hover:text-gray-900"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'
          } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-medical-500 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-medical-600 bg-clip-text text-transparent">
                ClinicFlow
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-600' : ''}`} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className={`flex items-center ${!sidebarOpen ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-medical-400 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[user?.role]}`}>
                  {roleLabels[user?.role]}
                </span>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-danger hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
          <div className="lg:hidden w-12" />
          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* AI Chat Bot */}
      <AIChatWidget />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
