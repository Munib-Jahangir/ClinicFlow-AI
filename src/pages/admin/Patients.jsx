import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Phone, Droplet, AlertCircle, UserPlus } from 'lucide-react';
import insforge from '../../api/insforge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data, error } = await insforge.database.from('patients').select('*').order('name');
      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.target);
    const patientData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      dob: formData.get('dob'),
      gender: formData.get('gender'),
      blood_group: formData.get('blood_group'),
      allergies: formData.get('allergies') || 'None',
      visits: editingPatient ? editingPatient.visits : 0
    };

    try {
      let result;
      if (editingPatient) {
        result = await insforge.database
          .from('patients')
          .update(patientData)
          .eq('id', editingPatient.id);
      } else {
        result = await insforge.database
          .from('patients')
          .insert([patientData]);
      }

      if (result.error) throw result.error;

      setShowModal(false);
      fetchPatients();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently remove this patient from the records?')) return;
    try {
      const { error } = await insforge.database.from('patients').delete().eq('id', id);
      if (error) throw error;
      fetchPatients();
    } catch (err) {
      alert('Error deleting patient: ' + err.message);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.phone && p.phone.includes(searchTerm))
  );

  const bloodColors = {
    'A+': 'bg-red-50 text-red-600 border-red-100',
    'A-': 'bg-red-50 text-red-500 border-red-100',
    'B+': 'bg-blue-50 text-blue-600 border-blue-100',
    'B-': 'bg-blue-50 text-blue-500 border-blue-100',
    'AB+': 'bg-purple-50 text-purple-600 border-purple-100',
    'AB-': 'bg-purple-50 text-purple-500 border-purple-100',
    'O+': 'bg-green-50 text-green-600 border-green-100',
    'O-': 'bg-green-50 text-green-500 border-green-100',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Directory</h1>
          <p className="text-gray-500 font-medium">Manage and track all patient medical records</p>
        </div>
        <Button onClick={() => { setEditingPatient(null); setShowModal(true); }}>
          <UserPlus className="w-5 h-5 mr-2" /> Register Patient
        </Button>
      </div>

      {/* Search */}
      <Card className="!p-4 bg-white/50 backdrop-blur-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or contact number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none shadow-sm transition-all"
          />
        </div>
      </Card>

      {/* Patients Table */}
      <Card className="!p-0 overflow-hidden shadow-xl ring-1 ring-gray-100 border-none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Patient Details</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Info</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">DOB / Gender</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Blood Type</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Sessions</th>
                <th className="px-6 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">Accessing database...</td></tr>
              ) : filteredPatients.length > 0 ? filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-primary-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-medical-400 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 leading-none mb-1">{patient.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[150px]">{patient.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-300" />
                      {patient.phone || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-gray-900 mb-1">{patient.dob || 'Unknown'}</p>
                    <Badge variant={patient.gender === 'Male' ? 'info' : 'medical'} className="text-[10px]">{patient.gender}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    {patient.blood_group ? (
                      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-black border ${bloodColors[patient.blood_group] || 'bg-gray-100 text-gray-400'}`}>
                        <Droplet className="w-3 h-3 mr-1" />
                        {patient.blood_group}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-gray-900">{patient.visits || 0}</span>
                      <span className="text-[10px] text-gray-300 font-bold uppercase">Visits</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingPatient(patient); setShowModal(true); }}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-gray-100"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(patient.id)}
                        className="p-2 text-gray-400 hover:text-danger hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400">No patients registered in the system.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Register/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingPatient ? 'Update Patient Record' : 'New Patient Registration'} size="lg">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input name="name" label="Full Name" placeholder="Zainab Bibi" defaultValue={editingPatient?.name} required />
            <Input name="email" label="Email Address" type="email" placeholder="zainab.bibi@example.com" defaultValue={editingPatient?.email} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input name="phone" label="Contact Number" placeholder="+1 234 567 890" defaultValue={editingPatient?.phone} required />
            <Input name="dob" label="Date of Birth" type="date" defaultValue={editingPatient?.dob} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Select
              name="gender"
              label="Gender"
              defaultValue={editingPatient?.gender || 'Female'}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' },
              ]}
            />
            <Select
              name="blood_group"
              label="Blood Group"
              defaultValue={editingPatient?.blood_group || 'O+'}
              options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => ({ value: bg, label: bg }))}
            />
            <Input name="allergies" label="Known Allergies" placeholder="e.g. Peanuts, Aspirin" defaultValue={editingPatient?.allergies} />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>
              {editingPatient ? 'Update Profile' : 'Complete Registration'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PatientsList;
