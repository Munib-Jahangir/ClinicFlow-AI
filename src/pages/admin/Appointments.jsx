import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Stethoscope, Search, Filter, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import insforge from '../../api/insforge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';

const AdminAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const { data } = await insforge.database
                .from('appointments')
                .select('*, patients(name, phone), doctors(name, specialization)')
                .order('date', { ascending: false });

            setAppointments(data || []);
        } catch (err) {
            console.error('Error fetching appointments:', err);
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
            fetchAppointments();
        } catch (err) {
            console.error('Update failed:', err);
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        const matchesSearch =
            apt.patients?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.doctors?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filter === 'all' || apt.status === filter;

        return matchesSearch && matchesFilter;
    });

    const statusColors = {
        pending: 'warning',
        confirmed: 'success',
        completed: 'info',
        cancelled: 'danger',
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Total Bookings</h1>
                    <p className="text-gray-500 font-medium">Global appointment oversight</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="primary" className="px-4 py-1.5 text-sm font-black">
                        {appointments.length} TOTAL SESSIONS
                    </Badge>
                </div>
            </div>

            <Card>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by patient or doctor..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap ${filter === f
                                        ? 'bg-primary-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto -mx-6">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-y border-gray-100">
                                <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Patient</th>
                                <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Practitioner</th>
                                <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Schedule</th>
                                <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Type</th>
                                <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="text-right px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">Syncing records...</td></tr>
                            ) : filteredAppointments.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400">No appointments found matching your criteria.</td></tr>
                            ) : (
                                filteredAppointments.map((apt) => (
                                    <tr key={apt.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold">
                                                    {apt.patients?.name?.charAt(0).toUpperCase() || 'P'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 leading-tight">{apt.patients?.name || 'Deleted Patient'}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">{apt.patients?.phone || 'No phone'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Stethoscope className="w-4 h-4 text-medical-500" />
                                                <div>
                                                    <p className="text-sm font-bold text-gray-700 leading-tight">{apt.doctors?.name || 'Unassigned'}</p>
                                                    <p className="text-[10px] text-gray-400">{apt.doctors?.specialization}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900 leading-tight">{apt.date}</div>
                                            <div className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {apt.time}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="secondary" className="text-[10px]">{apt.type || 'Consultation'}</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={statusColors[apt.status] || 'info'} className="capitalize">
                                                {apt.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {apt.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(apt.id, 'confirmed')}
                                                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="Confirm"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Cancel"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                                <Button variant="secondary" size="sm" className="!p-2">
                                                    <FileText className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminAppointments;
