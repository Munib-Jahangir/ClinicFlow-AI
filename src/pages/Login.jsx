import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Stethoscope, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (result.success) {
      const roleRoutes = {
        admin: '/admin/dashboard',
        doctor: '/doctor/dashboard',
        receptionist: '/receptionist/dashboard',
        patient: '/patient/dashboard',
      };
      navigate(roleRoutes[result.user.role] || '/patient/dashboard');
    }
  };

  const demoAccounts = [
    { role: 'Admin', email: 'admin@demo.com', password: 'Demo@1234' },
    { role: 'Doctor', email: 'doctor@demo.com', password: 'Demo@1234' },
    { role: 'Receptionist', email: 'receptionist@demo.com', password: 'Demo@1234' },
    { role: 'Patient', email: 'patient@demo.com', password: 'Demo@1234' },
  ];

  const fillDemo = (demo) => {
    setEmail(demo.email);
    setPassword(demo.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-medical-50 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-medical-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-medical-500 rounded-2xl shadow-lg mb-4">
            <Stethoscope className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-medical-600 bg-clip-text text-transparent">
            ClinicFlow AI
          </h1>
          <p className="text-gray-500 mt-2">Smart Healthcare Management System</p>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome Back</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 font-bold hover:text-primary-700 transition-colors">
              Sign Up
            </Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 text-center mb-3">Quick Demo Access</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((demo) => (
                <button
                  key={demo.role}
                  onClick={() => fillDemo(demo)}
                  className="px-3 py-2 text-xs font-medium bg-gray-50 hover:bg-primary-50 text-gray-600 hover:text-primary-700 rounded-lg transition-colors"
                >
                  {demo.role}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          © 2026 ClinicFlow AI. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
