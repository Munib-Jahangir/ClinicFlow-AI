import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Plus, Search, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import insforge from '../../api/insforge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';

const ReceptionistDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [newAppointment, setNewAppointment] = useState({
    patient_id: '',
    doctor_id: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00 AM',
    type: 'Consultation',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const [aptsRes, patientsRes, doctorsRes] = await Promise.all([
        insforge.database.from('appointments').select('*, patients(name), doctors(name)').eq('date', today).order('time'),
        insforge.database.from('patients').select('id, name').order('name'),
        insforge.database.from('doctors').select('id, name, specialization').order('name')
      ]);

      setAppointments(aptsRes.data || []);
      setPatients(patientsRes.data || []);
      setDoctors(doctorsRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await insforge.database.from('appointments').insert([{
        ...newAppointment,
        status: 'confirmed'
      }]);

      if (error) throw error;

      setShowModal(false);
      fetchData();
      setNewAppointment({
        patient_id: '',
        doctor_id: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00 AM',
        type: 'Consultation',
        notes: ''
      });
    } catch (err) {
      alert('Error booking appointment: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await insforge.database.from('appointments').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.patients?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.doctors?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    pending: 'warning',
    confirmed: 'success',
    completed: 'info',
    cancelled: 'danger',
  };

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
  ];

  if (loading && appointments.length === 0) return <div className="p-8 text-center text-gray-500 italic">Synchronizing clinic schedule...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">Front Desk Dashboard</h1>
          <p className="text-gray-500 font-medium">Daily operations and appointment coordination.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="shadow-lg shadow-primary-200">
          <Plus className="w-5 h-5 mr-2" /> Schedule Visit
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatBlock label="Active Bookings" value={appointments.length} icon={Calendar} color="text-primary-600" bg="bg-primary-50" />
        <StatBlock label="Check-ins" value={appointments.filter(a => a.status === 'confirmed').length} icon={CheckCircle} color="text-success" bg="bg-success/10" />
        <StatBlock label="Waitlist" value={appointments.filter(a => a.status === 'pending').length} icon={Clock} color="text-warning" bg="bg-warning/10" />
        <StatBlock label="Revocation" value={appointments.filter(a => a.status === 'cancelled').length} icon={XCircle} color="text-danger" bg="bg-danger/10" />
      </div>

      {/* Control Bar */}
      <Card className="!p-4 bg-white/60 backdrop-blur-lg border-none shadow-sm">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by patient ID, name, or physician..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all shadow-inner"
          />
        </div>
      </Card>

      {/* Schedule Table */}
      <Card title="Clinical Queue" subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} className="border-none shadow-xl">
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                <Calendar className="w-10 h-10 text-gray-200" />
              </div>
              <p className="text-gray-400 font-bold tracking-tight uppercase">No records found for today</p>
            </div>
          ) : filteredAppointments.map((apt) => (
            <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-white border border-gray-50 rounded-3xl hover:shadow-lg hover:-translate-y-0.5 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex flex-col items-center justify-center border border-primary-200 shadow-sm group-hover:bg-primary-600 group-hover:from-primary-600 group-hover:to-primary-700 transition-all">
                <span className="text-sm font-black text-primary-700 group-hover:text-white leading-none mb-1">{apt.time.split(' ')[0]}</span>
                <span className="text-[10px] font-black text-primary-400 group-hover:text-primary-100 uppercase tracking-widest">{apt.time.split(' ')[1]}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-lg font-black text-gray-900 tracking-tight">{apt.patients?.name}</p>
                  <Badge variant={statusColors[apt.status] || 'gray'} className="text-[9px] px-2 py-0.5 rounded-md font-black italic">{apt.status}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs font-bold text-gray-400 flex items-center gap-1.5 capitalize">
                    <StethoscopeIcon className="w-3 h-3 text-medical-500" /> {apt.doctors?.name}
                  </p>
                  <div className="w-1 h-1 bg-gray-200 rounded-full" />
                  <p className="text-xs font-black text-primary-500 uppercase tracking-tighter">{apt.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {apt.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(apt.id, 'confirmed')} className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center hover:bg-success hover:text-white transition-all shadow-sm shadow-success/10">
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button onClick={() => updateStatus(apt.id, 'cancelled')} className="w-10 h-10 rounded-xl bg-danger/5 text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-all">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Booking Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Appointment Dispatch" size="lg">
        <form onSubmit={handleBookAppointment} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Select
              label="Select Patient Profile *"
              value={newAppointment.patient_id}
              onChange={(e) => setNewAppointment(prev => ({ ...prev, patient_id: e.target.value }))}
              options={patients.map(p => ({ value: p.id, label: p.name }))}
              required
            />
            <Select
              label="Assigned Physician *"
              value={newAppointment.doctor_id}
              onChange={(e) => setNewAppointment(prev => ({ ...prev, doctor_id: e.target.value }))}
              options={doctors.map(d => ({ value: d.id, label: `${d.name} (${d.specialization})` }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-1">
              <Input label="Session Date *" type="date" value={newAppointment.date} onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))} required />
            </div>
            <div>
              <Select label="Time Slot *" value={newAppointment.time} onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))} options={timeSlots.map(t => ({ value: t, label: t }))} required />
            </div>
            <div>
              <Input label="Visit Type" placeholder="Consultation" value={newAppointment.type} onChange={(e) => setNewAppointment(prev => ({ ...prev, type: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Concerns / Pre-op Notes</label>
            <textarea
              rows={3}
              placeholder="Enter specific patient concerns or special requests..."
              value={newAppointment.notes}
              onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-3xl shadow-inner focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none resize-none text-sm font-medium transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Discard</Button>
            <Button type="submit" loading={submitting}>Confirm Booking</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const StatBlock = ({ label, value, icon: Icon, color, bg }) => (
  <Card className="!p-6 border-none shadow-md hover:shadow-xl transition-all group">
    <div className="flex items-center gap-4">
      <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900 leading-none mb-1">{value}</p>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  </Card>
);

const StethoscopeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.8 2.3A.3.3 0 1 0 5 2a.3.3 0 0 0-.2.3Z" /><path d="M10 22v-2a2 2 0 0 0-2-2H2" /><path d="M22 14a2 2 0 0 0-2-2H2" /><path d="M14 22h1a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3Z" /><path d="M18 10h1a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1" />
  </svg>
);

export default ReceptionistDashboard;
