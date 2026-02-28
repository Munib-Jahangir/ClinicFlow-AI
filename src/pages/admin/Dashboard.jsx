import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Stethoscope, Calendar, DollarSign, TrendingUp, ArrowRight, Clock, Activity, Sparkles } from 'lucide-react';
import insforge from '../../api/insforge';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    revenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [topDiagnoses, setTopDiagnoses] = useState([
    { name: 'General Consultation', count: 12 },
    { name: 'Follow-up', count: 8 },
    { name: 'Emergency', count: 3 }
  ]);

  const [monthlyData] = useState([
    { month: 'Jan', appointments: 45, revenue: 2250 },
    { month: 'Feb', appointments: 52, revenue: 2600 },
    { month: 'Mar', appointments: 61, revenue: 3050 },
    { month: 'Apr', appointments: 38, revenue: 1900 },
    { month: 'May', appointments: 72, revenue: 3600 },
    { month: 'Jun', appointments: 85, revenue: 4250 },
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        { count: patientCount },
        { count: doctorCount },
        { data: allApts },
        { data: recentApts }
      ] = await Promise.all([
        insforge.database.from('patients').select('*', { count: 'exact', head: true }),
        insforge.database.from('doctors').select('*', { count: 'exact', head: true }),
        insforge.database.from('appointments').select('id, status'),
        insforge.database.from('appointments').select('*, patients(name)').order('date', { ascending: false }).limit(5)
      ]);

      const confirmedCount = allApts?.filter(a => a.status === 'confirmed' || a.status === 'completed').length || 0;

      setStats({
        patients: patientCount || 0,
        doctors: doctorCount || 0,
        appointments: allApts?.length || 0,
        revenue: confirmedCount * 100, // Roughly $100 per appointment
      });

      setRecentAppointments(recentApts || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: 'warning',
    confirmed: 'success',
    completed: 'info',
    cancelled: 'danger',
  };

  if (loading) return <div className="p-12 text-center text-gray-400 italic font-medium animate-pulse">Aggregating clinic intelligence...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 leading-none">Command Center</h1>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Operational Analytics & Oversight</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="medical" className="!px-4 !py-2 !rounded-xl border-none shadow-sm"><Sparkles className="w-4 h-4 mr-2" /> Global Sync Active</Badge>
          <Button variant="secondary" onClick={fetchDashboardData} size="sm" className="!p-2.5 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget label="Total Patients" value={stats.patients} icon={Users} color="text-primary-600" bg="bg-primary-50" trend="+4.5%" />
        <StatWidget label="Medical Staff" value={stats.doctors} icon={Stethoscope} color="text-medical-600" bg="bg-medical-50" trend="+12%" />
        <StatWidget label="Bookings" value={stats.appointments} icon={Calendar} color="text-amber-600" bg="bg-amber-50" trend="+8.2%" />
        <StatWidget label="Total Ledger" value={`$${stats.revenue.toLocaleString()}`} icon={DollarSign} color="text-emerald-600" bg="bg-emerald-50" trend="+15%" />
      </div>

      {/* Analytics Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card title="Patient Inflow" className="lg:col-span-2 shadow-xl border-none ring-1 ring-gray-100">
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="appointments" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Traffic Index" className="shadow-xl border-none ring-1 ring-gray-100">
          <div className="space-y-6 mt-4">
            {topDiagnoses.map((item, idx) => (
              <div key={idx} className="group">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-sm font-bold text-gray-700">{item.name}</p>
                  <p className="text-xs font-black text-primary-500">{item.count} sessions</p>
                </div>
                <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 transition-all duration-1000 group-hover:bg-primary-600"
                    style={{ width: `${(item.count / 15) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-8 border-t border-gray-50 flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">Systematic increase in <strong>Consultations</strong> observed over the last 14 day cycle.</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Real-time Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Recent Clinical Activity" action={
          <Link to="/admin/appointments" className="flex items-center text-xs font-black text-primary-600 hover:tracking-widest transition-all">
            FULL LOG <ArrowRight className="w-3 h-3 ml-2" />
          </Link>
        } className="shadow-lg border-none">
          <div className="space-y-3">
            {recentAppointments.length === 0 ? (
              <p className="py-10 text-center text-gray-300 italic">No activity logs recorded.</p>
            ) : recentAppointments.map(apt => (
              <div key={apt.id} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 hover:bg-white hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                  <Clock className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900 tracking-tight">{apt.patients?.name || 'Patient Deleted'}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{apt.date} • {apt.time}</p>
                </div>
                <Badge variant={statusColors[apt.status] || 'info'} className="text-[9px] font-black italic">{apt.status}</Badge>
                <Button variant="secondary" size="sm" className="!p-1.5 shadow-none border-none bg-transparent hover:bg-gray-100">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Platform Revenue" className="shadow-lg border-none bg-gradient-to-br from-white to-emerald-50/20">
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" hide />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}
                  formatter={(v) => [`$${v}`, 'Gross Revenue']}
                />
                <Line
                  type="step"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#10b981', strokeWidth: 4, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Fiscal Status</p>
              <p className="font-bold text-emerald-600">Surplus Cycle</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">EBITDA</p>
              <p className="font-black text-gray-900">$12,490.00</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const StatWidget = ({ label, value, icon: Icon, color, bg, trend }) => (
  <Card className="!p-6 border-none shadow-md hover:shadow-2xl transition-all group relative overflow-hidden">
    <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${bg} border border-white/10 opacity-20 rounded-full group-hover:scale-150 transition-transform duration-700`} />
    <div className="flex justify-between items-start relative z-10">
      <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center shadow-inner`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
        <TrendingUp className="w-3 h-3" />
        <span className="text-[10px] font-black tracking-tighter">{trend}</span>
      </div>
    </div>
    <div className="mt-8 relative z-10">
      <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none mb-1">{value}</p>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
    </div>
  </Card>
);

const StethoscopeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.8 2.3A.3.3 0 1 0 5 2a.3.3 0 0 0-.2.3Z" /><path d="M10 22v-2a2 2 0 0 0-2-2H2" /><path d="M22 14a2 2 0 0 0-2-2H2" /><path d="M14 22h1a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3Z" /><path d="M18 10h1a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1" />
  </svg>
);

export default AdminDashboard;
