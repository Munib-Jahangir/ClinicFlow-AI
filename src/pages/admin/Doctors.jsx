import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, AlertCircle } from 'lucide-react';
import insforge from '../../api/insforge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const { data, error } = await insforge.database.from('doctors').select('*').order('name');
      if (error) throw error;
      setDoctors(data || []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.target);
    const doctorData = {
      name: formData.get('name'),
      email: formData.get('email'),
      specialization: formData.get('specialization'),
      qualification: formData.get('qualification'),
      fee: parseFloat(formData.get('fee')),
      experience: parseInt(formData.get('experience')),
      status: 'active'
    };

    try {
      let result;
      if (editingDoctor) {
        result = await insforge.database
          .from('doctors')
          .update(doctorData)
          .eq('id', editingDoctor.id);
      } else {
        // Register User first
        const password = formData.get('password') || 'Pass123!';
        const { data: authData, error: authError } = await insforge.auth.signUp({
          email: doctorData.email,
          password: password,
          name: doctorData.name
        });

        if (authError) throw authError;

        const userId = authData.user.id;

        // Create Profile
        await insforge.database.from('profiles').insert([{
          id: userId,
          name: doctorData.name,
          email: doctorData.email,
          role: 'doctor'
        }]);

        // Create Doctor record
        result = await insforge.database
          .from('doctors')
          .insert([{
            ...doctorData,
            profile_id: userId
          }]);
      }

      if (result.error) throw result.error;

      setShowModal(false);
      fetchDoctors();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this doctor?')) return;

    try {
      const { error } = await insforge.database.from('doctors').delete().eq('id', id);
      if (error) throw error;
      fetchDoctors();
    } catch (err) {
      alert('Error deleting doctor: ' + err.message);
    }
  };

  const filteredDoctors = doctors.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.specialization && d.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const statusColors = {
    active: 'success',
    on_leave: 'warning',
    inactive: 'danger',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors Management</h1>
          <p className="text-gray-500">Manage clinic doctors and their availability</p>
        </div>
        <Button onClick={() => { setEditingDoctor(null); setShowModal(true); }}>
          <Plus className="w-5 h-5 mr-2" /> Add Doctor
        </Button>
      </div>

      {/* Search */}
      <Card className="!p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search doctors by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
      </Card>

      {/* Doctors Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading clinical staff...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.length > 0 ? filteredDoctors.map((doctor) => (
            <Card key={doctor.id} hover className="!p-0 overflow-hidden border-none shadow-md">
              <div className="h-20 bg-gradient-to-r from-primary-500 to-medical-500" />
              <div className="px-6 pb-6">
                <div className="relative -mt-10 mb-4 text-center sm:text-left">
                  <div className="w-20 h-20 bg-white rounded-3xl p-1 shadow-xl mx-auto sm:mx-0">
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 white to-medical-400 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                      {doctor.name.charAt(0)}
                    </div>
                  </div>
                  <Badge variant={statusColors[doctor.status] || 'success'} className="absolute -bottom-2 left-1/2 -translate-x-1/2 sm:left-14 sm:translate-x-0">
                    {doctor.status || 'active'}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mt-4 text-center sm:text-left">{doctor.name}</h3>
                <p className="text-primary-600 font-semibold text-center sm:text-left">{doctor.specialization || 'Consultant'}</p>
                <p className="text-xs text-gray-400 mt-1 text-center sm:text-left truncate">{doctor.email}</p>

                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900">{doctor.experience || '0'}y</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Exp</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900">${doctor.fee || '0'}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Fee</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditingDoctor(doctor); setShowModal(true); }}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doctor.id)}
                      className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )) : (
            <div className="col-span-full py-20 text-center text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <Plus className="w-12 h-12 mx-auto mb-4 text-gray-100" />
              <p className="font-medium">No doctors found matching filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingDoctor ? 'Edit Doctor Profile' : 'Register New Doctor'} size="lg">
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-shake">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input name="name" label="Doctor Name" placeholder="Dr. Ahmed Khan" defaultValue={editingDoctor?.name} required />
            <Input name="email" label="Professional Email" type="email" placeholder="ahmed.khan@clinic.pk" defaultValue={editingDoctor?.email} required />
          </div>

          {!editingDoctor && (
            <Input name="password" label="Temporary Password" type="password" placeholder="••••••••" required />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select
              name="specialization"
              label="Specialization"
              defaultValue={editingDoctor?.specialization || 'General Medicine'}
              options={[
                { value: 'General Medicine', label: 'General Medicine' },
                { value: 'Cardiology', label: 'Cardiology' },
                { value: 'Pediatrics', label: 'Pediatrics' },
                { value: 'Orthopedics', label: 'Orthopedics' },
                { value: 'Dermatology', label: 'Dermatology' },
                { value: 'Neurology', label: 'Neurology' },
                { value: 'Psychiatry', label: 'Psychiatry' },
              ]}
            />
            <Input name="qualification" label="Academic Qualification" placeholder="MBBS, MD" defaultValue={editingDoctor?.qualification} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input name="experience" label="Years of Experience" type="number" placeholder="5" defaultValue={editingDoctor?.experience} />
            <Input name="fee" label="Consultation Fee ($)" type="number" placeholder="100" defaultValue={editingDoctor?.fee} required />
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Discard</Button>
            <Button type="submit" loading={submitting}>
              {editingDoctor ? 'Save Changes' : 'Confirm Registration'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorsList;
