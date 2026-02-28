import { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, Brain, ArrowRight, CheckCircle, Sparkles, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import insforge from '../../api/insforge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    today: 0,
    monthly: 0,
    patients: 0,
    pending: 0
  });

  useEffect(() => {
    if (user?.email) {
      fetchDoctorDashboard();
    }
  }, [user]);

  const fetchDoctorDashboard = async () => {
    setLoading(true);
    try {
      // Find doctor by email
      const { data: doctors } = await insforge.database
        .from('doctors')
        .select('*')
        .eq('email', user.email)
        .limit(1);

      const doc = doctors?.[0];
      setDoctorData(doc);

      if (doc) {
        // Fetch today's appointments
        const todayStr = new Date().toISOString().split('T')[0];
        const { data: todayApts } = await insforge.database
          .from('appointments')
          .select('*, patients(name, phone)')
          .eq('doctor_id', doc.id)
          .eq('date', todayStr)
          .order('time', { ascending: true });

        setAppointments(todayApts || []);

        // Fetch stats
        const { count: monthCount } = await insforge.database
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('doctor_id', doc.id);

        const { data: patientList } = await insforge.database
          .from('patients')
          .select('id', { count: 'exact' });

        setStats({
          today: todayApts?.length || 0,
          monthly: monthCount || 0,
          patients: patientList?.length || 0,
          pending: (todayApts || []).filter(a => a.status === 'pending').length
        });
      }
    } catch (err) {
      console.error('Error fetching doctor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: 'warning',
    confirmed: 'info',
    completed: 'success',
    cancelled: 'danger',
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Initializing clinical dashboard...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-medical-500 to-medical-600 rounded-2xl flex items-center justify-center shadow-lg shadow-medical-200">
            <StethoscopeIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medical Dashboard</h1>
            <p className="text-gray-500 font-medium">Welcome back, {doctorData?.name || user?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="medical" className="px-4 py-1.5 text-sm">
            <Sparkles className="w-4 h-4 mr-2" /> {doctorData?.specialization || 'General Practitioner'}
          </Badge>
          <button onClick={fetchDoctorDashboard} className="p-2 text-gray-400 hover:text-medical-600 transition-colors">
            <TrendingUp className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatItem
          icon={Calendar}
          label="Today's Sessions"
          value={stats.today}
          color="bg-primary-500"
          subtext={`${stats.pending} pending actions`}
        />
        <StatItem
          icon={Users}
          label="Total Patients"
          value={stats.patients}
          color="bg-medical-500"
          subtext="Clinic-wide data"
        />
        <StatItem
          icon={FileText}
          label="Case Files"
          value={stats.monthly}
          color="bg-amber-500"
          subtext="Lifetime appointments"
        />
        <StatItem
          icon={CheckCircle}
          label="Performance"
          value="98%"
          color="bg-emerald-500"
          subtext="Patient satisfaction"
        />
      </div>

      {/* Action Banners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="!p-0 overflow-hidden group">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 flex items-center justify-between text-white">
            <div className="space-y-1">
              <h3 className="text-xl font-bold">Clinical AI Engine</h3>
              <p className="text-primary-100 text-sm">Predictive diagnosis & symptom analysis.</p>
              <Link to="/doctor/ai-checker">
                <Button variant="light" className="mt-4 !bg-white/10 !text-white hover:!bg-white hover:!text-primary-700 border-none backdrop-blur-md">
                  Launch AI Diagnostics <Brain className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <Brain className="w-10 h-10 text-white" />
            </div>
          </div>
        </Card>

        <Card className="!p-0 overflow-hidden group">
          <div className="bg-gradient-to-r from-medical-600 to-medical-700 p-6 flex items-center justify-between text-white">
            <div className="space-y-1">
              <h3 className="text-xl font-bold">E-Prescription</h3>
              <h3 className="text-xl font-bold">E-Prescription</h3>
              <p className="text-medical-100 text-sm">Generate digital medicine slips in seconds.</p>
              <Link to="/doctor/prescriptions">
                <Button variant="light" className="mt-4 !bg-white/10 !text-white hover:!bg-white hover:!text-medical-700 border-none backdrop-blur-md">
                  Compose RX <FileText className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center -rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <FileText className="w-10 h-10 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card title="Today's Patient Queue" subtitle={`${appointments.length} patients arriving today`}>
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-200" />
              <p className="text-gray-500 font-medium">Your queue is currently empty.</p>
              <p className="text-sm text-gray-400 mt-1">Check back later or view tomorrow's schedule.</p>
            </div>
          ) : (
            appointments.map((apt) => (
              <div key={apt.id} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  <span className="font-bold text-xs">{apt.time?.split(':')[0]}:{apt.time?.split(':')[1]}</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{apt.patients?.name || 'Unknown Patient'}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <User className="w-3 h-3 text-medical-500" /> {apt.type || 'General Checkup'}
                  </p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1">
                  <Badge variant={statusColors[apt.status] || 'info'}>{apt.status}</Badge>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{apt.patients?.phone || 'No Phone'}</p>
                </div>
                <Button size="sm" variant="secondary" className="!p-2">
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

const StatItem = ({ icon: Icon, label, value, color, subtext }) => (
  <Card className="!p-6 border-none shadow-sm hover:shadow-md transition-shadow">
    <div className="flex flex-col gap-4">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-3xl font-black text-gray-900">{value}</p>
        <p className="text-sm font-bold text-gray-400">{label}</p>
        <p className="text-[10px] text-gray-300 mt-1 uppercase font-black tracking-widest leading-none">{subtext}</p>
      </div>
    </div>
  </Card>
);

const StethoscopeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.8 2.3A.3.3 0 1 0 5 2a.3.3 0 0 0-.2.3Z" /><path d="M10 22v-2a2 2 0 0 0-2-2H2" /><path d="M22 14a2 2 0 0 0-2-2H2" /><path d="M14 22h1a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3Z" /><path d="M18 10h1a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1" />
  </svg>
);

export default DoctorDashboard;
