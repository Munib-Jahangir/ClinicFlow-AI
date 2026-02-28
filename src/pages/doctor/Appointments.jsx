import { useState, useEffect } from 'react';
import { Calendar, Clock, User, UserCheck, Search, Filter, CheckCircle, XCircle, AlertCircle, FileText, FileSearch, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import insforge from '../../api/insforge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';

const DoctorAppointments = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [doctorData, setDoctorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (user?.email) {
            fetchDoctorAndAppointments();
        }
    }, [user]);

    const fetchDoctorAndAppointments = async () => {
        setLoading(true);
        try {
            // 1. Get doctor profile
            const { data: doctors } = await insforge.database
                .from('doctors')
                .select('*')
                .eq('email', user.email)
                .limit(1);

            const doc = doctors?.[0];
            setDoctorData(doc);

            if (doc) {
                // 2. Get appointments for this doctor
                const { data } = await insforge.database
                    .from('appointments')
                    .select('*, patients(*)')
                    .eq('doctor_id', doc.id)
                    .order('date', { ascending: false });

                setAppointments(data || []);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const { error } = await insforge.database
                .from('appointments')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            fetchDoctorAndAppointments();
        } catch (err) {
            console.error('Update failed:', err);
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        const matchesSearch = apt.patients?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || apt.status === filter;
        return matchesSearch && matchesFilter;
    });

    const statusColors = {
        pending: 'warning',
        confirmed: 'success',
        completed: 'info',
        cancelled: 'danger',
    };

    if (!doctorData && !loading) return (
        <div className="p-12 text-center bg-red-50 border border-red-100 rounded-3xl">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-800 font-bold">Doctor Profile Not Found</p>
            <p className="text-sm text-red-600">Please contact support to link your user account to a clinical profile.</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 leading-none">Your Case Queue</h1>
                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Medical sessions & patient scheduling</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="medical" className="px-4 py-1.5 text-sm font-black">
                        {appointments.filter(a => a.status === 'confirmed').length} CONFIRMED TODAY
                    </Badge>
                </div>
            </div>

            <Card>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search patients by name..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-medical-500 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                        {['all', 'pending', 'confirmed', 'completed'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-5 py-2.5 rounded-2xl text-xs font-black capitalize transition-all whitespace-nowrap ${filter === f
                                        ? 'bg-medical-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="py-12 text-center text-gray-400 italic font-medium">Loading medical queue...</div>
                    ) : filteredAppointments.length === 0 ? (
                        <div className="py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                            <p className="text-gray-500 font-medium">No sessions scheduled here.</p>
                        </div>
                    ) : (
                        filteredAppointments.map((apt) => (
                            <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-white border border-gray-100 rounded-3xl hover:shadow-xl transition-all group border-l-4 border-l-medical-500">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-14 h-14 bg-medical-50 rounded-2xl flex flex-col items-center justify-center text-medical-600 group-hover:bg-medical-600 group-hover:text-white transition-all shadow-inner">
                                        <span className="text-[10px] font-black">{apt.date?.split('-')[2]}</span>
                                        <span className="text-xs font-black uppercase tracking-tighter">{apt.time?.split(':')[0]}:{apt.time?.split(':')[1]}</span>
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-gray-900 group-hover:text-medical-700 transition-colors uppercase tracking-tight">{apt.patients?.name || 'Incomplete Profile'}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-gray-400 font-bold flex items-center gap-1"><User className="w-3 h-3" /> {apt.patients?.gender || 'N/A'} • {apt.patients?.phone || 'No Contact'}</span>
                                            <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest leading-none py-0.5">{apt.type || 'Consultation'}</Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 ml-auto sm:ml-0">
                                    <Badge variant={statusColors[apt.status] || 'info'} className="px-4 py-1.5 text-[10px] font-black uppercase">{apt.status}</Badge>

                                    <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                                        {apt.status === 'pending' && (
                                            <button onClick={() => handleStatusUpdate(apt.id, 'confirmed')} className="p-2 text-emerald-500 hover:bg-white rounded-xl shadow-sm transition-all" title="Confirm Appointment">
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                        )}
                                        {apt.status === 'confirmed' && (
                                            <button onClick={() => handleStatusUpdate(apt.id, 'completed')} className="p-2 text-primary-500 hover:bg-white rounded-xl shadow-sm transition-all" title="Mark as Completed">
                                                <UserCheck className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button className="p-2 text-gray-400 hover:bg-white hover:text-medical-600 rounded-xl shadow-sm transition-all" title="View Patient History">
                                            <FileSearch className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:bg-white hover:text-amber-600 rounded-xl shadow-sm transition-all" title="Write Prescription">
                                            <FileText className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <Button size="sm" variant="secondary" className="!p-2 shadow-none border-none group-hover:bg-medical-50">
                                        <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-medical-600" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
};

export default DoctorAppointments;
