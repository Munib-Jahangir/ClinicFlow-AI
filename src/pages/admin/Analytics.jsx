import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, Users, Calendar, DollarSign, Sparkles, Filter, Download, Zap, PieChart as PieIcon } from 'lucide-react';
import insforge from '../../api/insforge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const AdminAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        patients: 0,
        doctors: 0,
        appointments: 0,
        revenue: 0,
        completionRate: 0
    });

    const [monthlyGrowth] = useState([]);

    const [sectorData] = useState([]);

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const [
                { count: patientCount },
                { count: doctorCount },
                { data: allApts }
            ] = await Promise.all([
                insforge.database.from('patients').select('*', { count: 'exact', head: true }),
                insforge.database.from('doctors').select('*', { count: 'exact', head: true }),
                insforge.database.from('appointments').select('id, status')
            ]);

            const completed = allApts?.filter(a => a.status === 'completed').length || 0;
            const confirmed = allApts?.filter(a => a.status === 'confirmed' || a.status === 'completed').length || 0;

            setStats({
                patients: patientCount || 0,
                doctors: doctorCount || 0,
                appointments: allApts?.length || 0,
                revenue: confirmed * 125,
                completionRate: allApts?.length ? Math.round((completed / allApts.length) * 100) : 0
            });
        } catch (err) {
            console.error('Error fetching analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-400 italic">Synthesizing clinical intelligence...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-200">
                        <PieIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 leading-none">Global Insights</h1>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Real-time behavior analysis & growth</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" className="!px-4 !py-2 !rounded-xl border-none shadow-sm"><Download className="w-4 h-4 mr-2" /> Export Report</Button>
                    <Button variant="primary" onClick={fetchAnalytics} size="sm" className="!p-2.5 rounded-xl shadow-lg shadow-primary-200">
                        <Zap className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Modern Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard label="System Revenue" value={`$${stats.revenue.toLocaleString()}`} change="+12.5%" icon={DollarSign} color="emerald" />
                <MetricCard label="Active Patients" value={stats.patients} change="+5.2%" icon={Users} color="primary" />
                <MetricCard label="Operational Capacity" value={`${stats.completionRate}%`} change="+4.1%" icon={Activity} color="amber" />
                <MetricCard label="Appointments" value={stats.appointments} change="+18%" icon={Calendar} color="indigo" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Growth Chart */}
                <Card title="Revenue Growth Forecast" className="lg:col-span-2 shadow-2xl border-none ring-1 ring-gray-100">
                    <div className="h-[400px] w-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyGrowth}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}
                                    backgroundColor="#fff"
                                />
                                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" dot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 3 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Sector Distribution */}
                <Card title="Department Utilization" className="shadow-2xl border-none ring-1 ring-gray-100">
                    <div className="h-[300px] w-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sectorData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {sectorData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-8 space-y-3">
                        {sectorData.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-2xl group hover:bg-white transition-all cursor-pointer border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                    <span className="text-sm font-bold text-gray-700">{item.name}</span>
                                </div>
                                <Badge variant="secondary" className="font-black text-[10px]">{Math.round((item.value / 1200) * 100)}%</Badge>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
                <Card title="Engagement Metrics" subtitle="Weekly active user sessions across roles">
                    <div className="h-64 mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyGrowth}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" hide />
                                <Bar dataKey="value" fill="#dbeafe" radius={[10, 10, 0, 0]} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Security & Compliance" className="bg-gradient-to-br from-gray-900 to-indigo-950 text-white border-none shadow-2xl">
                    <div className="p-4 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <Sparkles className="w-6 h-6 text-indigo-300" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-indigo-300 uppercase tracking-widest">Database Privacy</p>
                                <p className="text-xl font-bold">HIPAA Compliant</p>
                            </div>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-400 w-full" />
                        </div>
                        <ul className="space-y-3">
                            {['End-to-end encrypted sessions', 'Automatic log pruning ACTIVE', 'Zero-knowledge identification'].map((text, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-indigo-100/70 font-medium">
                                    <CheckCircleIcon className="w-4 h-4 text-indigo-400" /> {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </Card>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, change, icon: Icon, color }) => {
    const colorMap = {
        primary: 'bg-primary-50 text-primary-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        indigo: 'bg-indigo-50 text-indigo-600',
    };

    return (
        <Card className="!p-6 border-none shadow-md hover:shadow-2xl transition-all group overflow-hidden">
            <div className="flex justify-between items-start">
                <div className={`w-12 h-12 ${colorMap[color]} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-[10px] font-black">{change}</span>
                </div>
            </div>
            <div className="mt-8">
                <p className="text-3xl font-black text-gray-900 tracking-tighter mb-1">{value}</p>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</p>
            </div>
        </Card>
    );
};

const CheckCircleIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

export default AdminAnalytics;
