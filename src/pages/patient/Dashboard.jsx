import { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, Download, User, Activity, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import insforge from '../../api/insforge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { jsPDF } from 'jspdf';
import { ChevronRight } from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchPatientData();
    }
  }, [user]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      // First find the patient record by email
      const { data: patients, error: pError } = await insforge.database
        .from('patients')
        .select('*')
        .eq('email', user.email)
        .limit(1);

      if (pError) throw pError;

      const pRecord = patients?.[0];
      setPatientData(pRecord);

      if (pRecord) {
        // Fetch appointments
        const { data: apts } = await insforge.database
          .from('appointments')
          .select('*, doctors(name, specialization)')
          .eq('patient_id', pRecord.id)
          .order('date', { ascending: true });

        setAppointments(apts || []);

        // Fetch prescriptions
        const { data: drugs } = await insforge.database
          .from('prescriptions')
          .select('*, doctors(name)')
          .eq('patient_id', pRecord.id)
          .order('created_at', { ascending: false });

        setPrescriptions(drugs || []);

        // History is aggregated from appointments and prescriptions
        const aggregatedHistory = [
          ...(apts || []).map(a => ({
            id: `a-${a.id}`,
            type: 'appointment',
            title: 'Consultation',
            date: a.date,
            details: `Visit with ${a.doctors?.name || 'Doctor'}`,
            status: a.status
          })),
          ...(drugs || []).map(d => ({
            id: `p-${d.id}`,
            type: 'prescription',
            title: 'Prescription Issued',
            date: d.created_at?.split('T')[0],
            details: `Diagnosis: ${d.diagnosis}`,
            status: 'completed'
          }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        setHistory(aggregatedHistory);
      }
    } catch (err) {
      console.error('Error fetching patient dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPrescription = (rx) => {
    const doc = new jsPDF();
    const today = new Date(rx.created_at).toLocaleDateString();

    // Header
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ClinicFlow AI', 20, 20);
    doc.setFontSize(10);
    doc.text('Official Medical Prescription', 20, 30);

    // Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Patient: ${user.name}`, 20, 55);
    doc.text(`Doctor: ${rx.doctors?.name || 'Dr. Specialist'}`, 20, 62);
    doc.text(`Date: ${today}`, 150, 55);

    // Diagnosis
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnosis:', 20, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(rx.diagnosis || 'N/A', 20, 87);

    // Medicines
    let y = 100;
    doc.setFont('helvetica', 'bold');
    doc.text('Prescribed Medication:', 20, y);
    y += 10;
    doc.setFontSize(10);

    try {
      const medicines = typeof rx.medicines === 'string' ? JSON.parse(rx.medicines) : rx.medicines;
      medicines.forEach((med, i) => {
        doc.text(`${i + 1}. ${med.name} - ${med.dosage} (${med.frequency}) for ${med.duration}`, 25, y);
        y += 7;
        if (med.instructions) {
          doc.setFont('helvetica', 'italic');
          doc.text(`   Instruction: ${med.instructions}`, 25, y);
          doc.setFont('helvetica', 'normal');
          y += 7;
        }
      });
    } catch (e) {
      doc.text('Medicine list details available on record.', 25, y);
    }

    if (rx.notes) {
      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Doctor\'s Notes:', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(rx.notes, 20, y + 7);
    }

    doc.save(`RX_${user.name}_${today}.pdf`);
  };

  const statusColors = {
    pending: 'warning',
    confirmed: 'success',
    completed: 'info',
    cancelled: 'danger',
  };

  const nextAppointment = appointments.find(a => a.status === 'confirmed' || a.status === 'pending');

  const typeIcons = {
    appointment: Calendar,
    prescription: FileText,
    diagnosis: Activity,
  };

  const typeColors = {
    appointment: 'bg-primary-100 text-primary-700',
    prescription: 'bg-emerald-100 text-emerald-700',
    diagnosis: 'bg-purple-100 text-purple-700',
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your health records...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-500">Here's your latest health overview</p>
        </div>
        <div className="flex items-center gap-2">
          {patientData?.blood_group && <Badge variant="medical">Blood: {patientData.blood_group}</Badge>}
          <Badge variant="info">ID: {patientData?.id || 'N/A'}</Badge>
        </div>
      </div>

      {!patientData && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">We couldn't link your account to a patient record. Please contact the clinic administrator.</p>
        </div>
      )}

      {/* Next Appointment Banner */}
      {nextAppointment && (
        <Card className="!p-0 overflow-hidden bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200 border-none">
          <div className="p-6 relative">
            <Sparkles className="absolute top-4 right-4 w-12 h-12 text-white/10 rotate-12" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-xs font-bold uppercase tracking-wider mb-2">Upcoming Consultation</p>
                <h3 className="text-2xl font-bold">{nextAppointment.doctors?.name || 'Dr. Consultant'}</h3>
                <p className="text-primary-100 font-medium">{nextAppointment.doctors?.specialization || 'General Practitioner'}</p>
                <div className="flex items-center gap-5 mt-4">
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    <Calendar className="w-4 h-4 text-primary-200" />
                    <span className="text-sm font-semibold">{new Date(nextAppointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    <Clock className="w-4 h-4 text-primary-200" />
                    <span className="text-sm font-semibold">{nextAppointment.time || 'TBD'}</span>
                  </div>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="px-4 py-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/20 text-center">
                  <p className="text-[10px] text-primary-100 uppercase font-bold tracking-widest mb-1">Status</p>
                  <p className="font-bold capitalize">{nextAppointment.status}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <Card title="Appointment Schedule" className="lg:col-span-2">
          <div className="space-y-3">
            {appointments.length === 0 ? (
              <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                <p className="font-medium">No appointments scheduled</p>
                <Button variant="secondary" size="sm" className="mt-4">Book New Appointment</Button>
              </div>
            ) : (
              appointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-primary-600">{new Date(apt.date).getDate()}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{apt.doctors?.name || 'Doctor'}</p>
                    <p className="text-xs text-gray-500">{apt.doctors?.specialization || 'Clinical Audit'}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={statusColors[apt.status] || 'info'}>{apt.status}</Badge>
                    <p className="text-xs text-gray-400 mt-1">{apt.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card className="!p-6 bg-gradient-to-br from-white to-primary-50/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Clinic Visits</p>
                <p className="text-2xl font-black text-gray-900">{patientData?.visits || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-6 bg-gradient-to-br from-white to-medical-50/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-medical-100 rounded-2xl flex items-center justify-center text-medical-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Prescriptions</p>
                <p className="text-2xl font-black text-gray-900">{prescriptions.length}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Prescriptions */}
      <Card title="My Prescriptions" action={
        <button className="text-sm text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 group">
          View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      }>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 col-span-2 text-center italic">No medicinal history found.</p>
          ) : prescriptions.map((rx) => (
            <div key={rx.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{rx.diagnosis}</p>
                  <p className="text-xs text-gray-500">{rx.doctors?.name} • {new Date(rx.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <Button size="sm" variant="secondary" className="!p-2 rounded-lg" onClick={() => handleDownloadPrescription(rx)}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Timeline */}
      <Card title="Activity Timeline" subtitle="Chronological health events">
        <div className="relative pt-4">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100" />
          <div className="space-y-8">
            {history.length === 0 ? (
              <p className="text-sm text-gray-400 italic pl-12">No recent clinic activity.</p>
            ) : history.map((event) => {
              const Icon = typeIcons[event.type] || Activity;
              return (
                <div key={event.id} className="relative pl-12">
                  <div className={`absolute left-4 w-5 h-5 -translate-x-1/2 rounded-full border-4 border-white flex items-center justify-center z-10 ${typeColors[event.type] || 'bg-gray-100'}`}>
                    <Icon className="w-2 h-2" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 hover:bg-white hover:shadow-sm transition-all">
                    <div>
                      <p className="text-xs font-bold text-gray-400 mb-0.5 uppercase tracking-tighter">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      <p className="font-bold text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-600">{event.details}</p>
                    </div>
                    <Badge variant={statusColors[event.status] || 'info'}>{event.status}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PatientDashboard;
