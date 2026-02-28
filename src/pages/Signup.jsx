import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Stethoscope, Eye, EyeOff, AlertCircle, User, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'patient',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [otp, setOtp] = useState('');
    const [showVerification, setShowVerification] = useState(false);
    const [success, setSuccess] = useState(false);
    const { signUp, verifyOTP, error } = useAuth();
    const navigate = useNavigate();

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await signUp(formData.email, formData.password, formData.name, formData.role);
        setLoading(false);

        if (result.success) {
            if (result.requireVerification) {
                setShowVerification(true);
            } else {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setVerifying(true);
        const result = await verifyOTP(formData.email, otp);
        setVerifying(false);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-medical-50 flex items-center justify-center p-4 text-center">
                <div className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100 max-w-md animate-scale-in">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Account Verified!</h2>
                    <p className="text-gray-500 mb-8">
                        Your account has been successfully created and verified. You will be redirected to the login page in 3 seconds.
                    </p>
                    <Button onClick={() => navigate('/login')} className="w-full">
                        Proceed to Login
                    </Button>
                </div>
            </div>
        );
    }

    if (showVerification) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-medical-50 flex items-center justify-center p-4">
                <div className="relative w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-medical-600 rounded-2xl shadow-lg mb-4">
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
                        <p className="text-gray-500 mt-2">We've sent a code to <span className="text-primary-600 font-bold">{formData.email}</span></p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-50">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleVerify} className="space-y-6">
                            <Input
                                label="Verification Code"
                                placeholder="Enter 6-digit code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                maxLength={6}
                                className="text-center text-2xl tracking-widest font-black"
                            />

                            <Button type="submit" className="w-full py-4" loading={verifying}>
                                Verify Account <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </form>

                        <div className="mt-8 text-center text-sm text-gray-500">
                            Didn't receive the code?{' '}
                            <button className="text-primary-600 font-bold hover:underline" onClick={handleSubmit}>
                                Resend
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-medical-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-medical-200/20 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-lg">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-medical-600 rounded-2xl shadow-lg mb-4">
                        <Stethoscope className="w-10 h-10 text-white" />
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-medical-600 bg-clip-text text-transparent italic">
                        ClinicFlow AI
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Professional Healthcare Management</p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-50">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                        <p className="text-sm text-gray-400 mt-1">Start your journey with ClinicFlow today</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-shake">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Input
                                label="Full Name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                required
                                prefix={<User className="w-4 h-4 text-gray-400" />}
                            />
                            <Select
                                label="Role"
                                value={formData.role}
                                onChange={(e) => handleChange('role', e.target.value)}
                                options={[
                                    { value: 'patient', label: 'Patient' },
                                    { value: 'doctor', label: 'Doctor' },
                                    { value: 'receptionist', label: 'Receptionist' },
                                    { value: 'admin', label: 'Admin' },
                                ]}
                                required
                            />
                        </div>

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            required
                            prefix={<Mail className="w-4 h-4 text-gray-400" />}
                        />

                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                required
                                prefix={<Lock className="w-4 h-4 text-gray-400" />}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="pt-2">
                            <Button type="submit" className="w-full py-4 text-lg" loading={loading}>
                                {loading ? 'Initializing...' : 'Sign Up Now'}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500">
                            Already part of our network?{' '}
                            <Link to="/login" className="text-primary-600 font-bold hover:underline">
                                Log In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
