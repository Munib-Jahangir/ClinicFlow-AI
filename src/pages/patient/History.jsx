import { useState, useEffect } from 'react';
import { Clock, Activity, FileText, CheckCircle, AlertCircle, History, Calendar, Stethoscope, User, ArrowRight, Download, Brain } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import insforge from '../../api/insforge';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const PatientHistory = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.email) {
            fetchMedicalHistory();
        }
    }, [user]);

    const fetchMedicalHistory = async () => {
        setLoading(true);
        try {
            // 1. Get patient profile
            const { data: patients } = await insforge.database
                .from('patients')
                .select('*')
                .eq('email', user.email)
                .limit(1);

            const pt = patients?.[0];
            setPatientData(pt);

            if (pt) {
                // 2. Get appointments and prescriptions for this patient
                const { data: apts } = await insforge.database
                    .from('appointments')
                    .select('*, doctors(name, specialization)')
                    .eq('patient_id', pt.id)
                    .order('date', { ascending: false });

                const { data: prescs } = await insforge.database
                    .from('prescriptions')
                    .select('*')
                    .eq('patient_id', pt.id);

                // 3. Combine into a timeline
                const timeline = (apts || []).map(apt => {
                    const presc = (prescs || []).find(p => p.appointment_id === apt.id);
                    return { ...apt, prescription: presc };
                });

                setHistory(timeline);
            }
        } catch (err) {
            console.error('Error fetching medical history:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!patientData && !loading) return (
        <div className="p-12 text-center bg-gray-50 border border-gray-100 rounded-3xl">
            <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-bold">Health Profile Not Linked</p>
            <p className="text-sm text-gray-400">Please contact clinic staff to link your user ID to your medical records.</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center shadow-xl shadow-primary-200 rotate-3 group hover:rotate-0 transition-transform">
                        <History className="w-9 h-9 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 leading-none tracking-tight">Health History</h1>
                        <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest mt-2 px-1">Retrospective clinical timeline</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="primary" className="px-5 py-2 text-sm font-black italic rounded-xl border-none shadow-sm">
                        {history.length} CLINICAL SESSIONS
                    </Badge>
                </div>
            </div>

            {loading ? (
                <div className="py-24 text-center text-gray-400 italic font-black text-xl animate-pulse">Syncing with medical cloud...</div>
            ) : history.length === 0 ? (
                <Card className="py-20 text-center bg-gray-50 border-none ring-1 ring-gray-100">
                    <Calendar className="w-16 h-16 mx-auto mb-6 text-gray-200" />
                    <p className="text-gray-500 font-black text-xl">Operational history is clear.</p>
                    <p className="text-sm text-gray-400 mt-2">Your medical records will appear here after your first consultation.</p>
                </Card>
            ) : (
                <div className="relative space-y-12 before:absolute before:inset-y-0 before:left-8 before:w-1 before:bg-gradient-to-b before:from-primary-100 before:via-gray-100 before:to-transparent">
                    {history.map((item, idx) => (
                        <div key={item.id} className="relative pl-20 group">
                            {/* Timeline Marker */}
                            <div className="absolute left-4 top-0 w-8 h-8 rounded-full bg-white border-4 border-primary-500 shadow-lg z-10 group-hover:scale-125 transition-transform group-hover:bg-primary-500 group-hover:border-white" />

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {/* Timestamp */}
                                <div className="md:col-span-1 py-1">
                                    <p className="text-lg font-black text-gray-900 leading-none">{item.date?.split('-')[2]} {new Date(item.date).toLocaleString('default', { month: 'short' })}</p>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1 italic">{item.date?.split('-')[0]}</p>
                                    <div className="mt-4 flex flex-col gap-1.5">
                                        <Badge variant="secondary" className="w-fit text-[9px] font-black uppercase tracking-tighter shadow-sm">{item.time}</Badge>
                                        <Badge variant={item.status === 'completed' ? 'success' : 'info'} className="w-fit text-[9px] font-black uppercase tracking-tighter italic">{item.status}</Badge>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="md:col-span-3">
                                    <Card className="!p-0 overflow-hidden shadow-lg border-none hover:shadow-2xl transition-all duration-300 ring-1 ring-gray-100">
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                                        <Stethoscope className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Clinic Visit with</p>
                                                        <p className="text-lg font-black text-gray-900 tracking-tight">Dr. {item.doctors?.name || 'Assigned Physician'}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="medical" className="text-[10px] font-black">{item.type || 'Consultation'}</Badge>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-50">
                                                <div>
                                                    <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2"><Activity className="w-3 h-3 text-emerald-500" /> Diagnosis Result</h4>
                                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                        <p className="text-sm font-bold text-emerald-900 leading-relaxed">{item.diagnosis || 'Clinical evaluation pending...'}</p>
                                                    </div>
                                                </div>
                                                {item.prescription && (
                                                    <div>
                                                        <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2"><FileText className="w-3 h-3 text-amber-500" /> Prescribed Protocol</h4>
                                                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                                            <p className="text-xs font-bold text-amber-900 opacity-60 uppercase mb-1">{item.prescription.medications?.length || 0} Medications</p>
                                                            <p className="text-xs font-black text-amber-800 tracking-tight line-clamp-2">{item.prescription.notes}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Brain className="w-4 h-4 text-primary-500" />
                                                    <p className="text-[10px] font-black text-gray-400 italic">AI Health Insight derived from visit metadata.</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {item.prescription && (
                                                        <Button variant="secondary" size="sm" className="!rounded-xl shadow-sm border-gray-200">
                                                            <Download className="w-4 h-4 mr-2" /> Slip
                                                        </Button>
                                                    )}
                                                    <Button size="sm" variant="primary" className="!rounded-xl shadow-lg shadow-primary-100">
                                                        Full Report <ArrowRight className="w-4 h-4 ml-2" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientHistory;
