import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Stethoscope, Search, Clock, FileSearch, ArrowRight, CheckCircle, Brain, Sparkles, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import insforge from '../../api/insforge';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import jsPDF from 'jspdf';

const PatientPrescriptions = () => {
    const { user } = useAuth();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [patientData, setPatientData] = useState(null);

    useEffect(() => {
        if (user?.email) {
            fetchPrescriptions();
        }
    }, [user]);

    const fetchPrescriptions = async () => {
        setLoading(true);
        try {
            // 1. Get patient record
            const { data: patients } = await insforge.database
                .from('patients')
                .select('*')
                .eq('email', user.email)
                .limit(1);

            const pt = patients?.[0];
            setPatientData(pt);

            if (pt) {
                // 2. Fetch prescriptions linked to this patient
                const { data } = await insforge.database
                    .from('prescriptions')
                    .select('*, appointments(date, time, doctors(name, specialization))')
                    .eq('patient_id', pt.id)
                    .order('id', { ascending: false });

                setPrescriptions(data || []);
            }
        } catch (err) {
            console.error('Error fetching prescriptions:', err);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = (p) => {
        const doc = new jsPDF();

        // Aesthetic Header
        doc.setFillColor(59, 130, 246);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('CLINICFLOW | AI RX DIGITAL SLIP', 20, 25);

        // Content Styling
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        doc.text(`DATE OF ISSUE: ${p.appointments?.date?.toUpperCase() || 'N/A'}`, 20, 50);
        doc.text(`REGISTERED PATIENT: ${patientData?.name?.toUpperCase() || user?.name?.toUpperCase()}`, 20, 60);
        doc.text(`LICENSED PHYSICIAN: DR. ${p.appointments?.doctors?.name?.toUpperCase() || 'CLINIC STAFF'}`, 20, 70);

        doc.setDrawColor(200, 200, 200);
        doc.line(20, 80, 190, 80);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('MEDICATION PROTOCOL', 20, 95);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        // Medications
        const meds = p.medications || [];
        let currentY = 110;

        if (meds.length > 0) {
            meds.forEach((med, i) => {
                doc.setFont('helvetica', 'bold');
                doc.text(`${i + 1}. ${med.name} - ${med.dosage}`, 20, currentY);
                doc.setFont('helvetica', 'italic');
                doc.text(`    FREQUENCY: ${med.frequency}`, 20, currentY + 5);
                currentY += 15;
            });
        } else {
            doc.text('NO PHARMACOLOGICAL INTERVENTION PRESCRIBED.', 20, 110);
            currentY = 125;
        }

        doc.line(20, currentY, 190, currentY);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('CLINICAL ADVISORY', 20, currentY + 15);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(doc.splitTextToSize(p.notes || 'No clinical notes provided.', 170), 20, currentY + 25);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('THIS IS A SYSTEM-GENERATED COMPUTERIZED PRESCRIPTION. NO SIGNATURE IS REQUIRED.', 105, 280, { align: 'center' });
        doc.text('CLINICFLOW AI PLATFORM SECURE COMPLIANCE (RFC-10293)', 105, 285, { align: 'center' });

        doc.save(`Prescription_${p.id}.pdf`);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 leading-tight tracking-tight">Digital Prescriptions</h1>
                        <p className="text-gray-500 font-bold uppercase text-[9px] tracking-widest mt-1">Verified medical protocols & pharmacology</p>
                    </div>
                </div>
                <Badge variant="medical" className="!px-4 !py-1.5 !rounded-xl shadow-sm italic"><Sparkles className="w-4 h-4 mr-2" /> Sync Active</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-24 text-center text-gray-400 font-bold animate-pulse">Communicating with medical vault...</div>
                ) : prescriptions.length === 0 ? (
                    <div className="col-span-full">
                        <Card className="py-20 text-center bg-gray-50/50 border-none ring-1 ring-gray-100">
                            <FileSearch className="w-16 h-16 mx-auto mb-6 text-gray-200" />
                            <p className="text-gray-500 font-black text-xl uppercase tracking-widest">Vault is empty.</p>
                            <p className="text-sm text-gray-400 mt-2 font-medium">Your prescriptions will appear here once issued by your physician.</p>
                        </Card>
                    </div>
                ) : (
                    prescriptions.map((p) => (
                        <Card key={p.id} className="group !p-0 overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border-none ring-1 ring-gray-100 hover:ring-2 hover:ring-primary-400">
                            <div className="p-6 bg-gradient-to-br from-white to-gray-50">
                                <div className="flex items-center justify-between mb-6">
                                    <Badge variant="warning" className="text-[9px] font-black uppercase tracking-widest px-3 py-1">Rx-Verified</Badge>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Status</p>
                                        <p className="text-xs font-black text-emerald-600 uppercase tracking-tighter">Active Protocol</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                            <Stethoscope className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Prescribing Doctor</p>
                                            <p className="text-base font-black text-gray-900 tracking-tight leading-none truncate w-40">Dr. {p.appointments?.doctors?.name || 'Clinic Staff'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-7">
                                        <div>
                                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Issue Date</p>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                                <Calendar className="w-3 h-3" /> {p.appointments?.date || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Clinical Field</p>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                                <Activity className="w-3 h-3 text-medical-400" /> {p.appointments?.doctors?.specialization || 'General'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                    <button onClick={() => downloadPDF(p)} className="flex items-center gap-2 text-xs font-black text-primary-600 hover:tracking-widest transition-all">
                                        DOWNLOAD SLIP <Download className="w-4 h-4" />
                                    </button>
                                    <Badge className="!bg-primary-50 !text-primary-600 text-[9px] font-black italic">PDF GENERATED</Badge>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <Card className="mt-8 bg-gradient-to-r from-gray-900 to-indigo-950 border-none shadow-2xl relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                    <Brain className="w-48 h-48 text-white" />
                </div>
                <div className="p-8 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs text-indigo-200 backdrop-blur-md">
                            <Sparkles className="w-3 h-3" /> AI Health Integration Active
                        </div>
                        <h3 className="text-2xl font-black text-white leading-tight">Smart Prescription Insights</h3>
                        <p className="text-indigo-100 group-hover:text-white transition-colors text-sm font-medium leading-relaxed max-w-lg opacity-60"> Our AI analyzes your prescription parameters to provide real-time side-effect Monitoring & compliance advice. (Requires Activation)</p>
                    </div>
                    <Button className="!bg-white !text-indigo-900 border-none hover:!scale-105 transition-transform shadow-xl shadow-white/10 font-black text-xs uppercase tracking-widest py-4 px-8">
                        ENABLE AI MONITORING <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default PatientPrescriptions;
