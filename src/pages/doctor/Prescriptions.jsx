import { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, Download, Printer, Save, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import insforge from '../../api/insforge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { jsPDF } from 'jspdf';

const PrescriptionManager = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [doctorData, setDoctorData] = useState(null);
  const [prescription, setPrescription] = useState({
    diagnosis: '',
    notes: '',
    medicines: [
      { name: '', dosage: '', frequency: 'once_daily', duration: '5_days', instructions: '' }
    ],
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [{ data: pList }, { data: docs }] = await Promise.all([
        insforge.database.from('patients').select('id, name').order('name'),
        insforge.database.from('doctors').select('*').eq('email', user.email).limit(1)
      ]);
      setPatients(pList || []);
      setDoctorData(docs?.[0]);
    } catch (err) {
      console.error('Error fetching prescription data:', err);
    } finally {
      setLoading(false);
    }
  };

  const addMedicineRow = () => {
    setPrescription(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', frequency: 'once_daily', duration: '5_days', instructions: '' }]
    }));
  };

  const removeMedicineRow = (index) => {
    setPrescription(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const updateMedicine = (index, field, value) => {
    setPrescription(prev => ({
      ...prev,
      medicines: prev.medicines.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const handleSave = async () => {
    if (!selectedPatient || !prescription.diagnosis) {
      alert('Please select a patient and enter a diagnosis.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await insforge.database.from('prescriptions').insert([{
        patient_id: selectedPatient,
        doctor_id: doctorData?.id,
        diagnosis: prescription.diagnosis,
        medicines: JSON.stringify(prescription.medicines),
        notes: prescription.notes,
        created_at: new Date().toISOString()
      }]);

      if (error) throw error;

      alert('Prescription saved successfully!');
      // Reset form or redirect
    } catch (err) {
      alert('Error saving prescription: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const patientName = patients.find(p => p.id === selectedPatient)?.name || 'N/A';
    const today = new Date().toLocaleDateString();

    // Header
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ClinicFlow AI', 20, 20);
    doc.setFontSize(10);
    doc.text('Smart Healthcare Management System', 20, 30);

    // Doctor & Patient
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Dr. ${doctorData?.name || user?.name}`, 20, 55);
    doc.setFontSize(10);
    doc.text(doctorData?.specialization || 'Consultant', 20, 62);
    doc.text(`Patient: ${patientName}`, 20, 80);
    doc.text(`Date: ${today}`, 150, 80);

    // Diagnosis
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnosis:', 20, 95);
    doc.setFont('helvetica', 'normal');
    doc.text(prescription.diagnosis || 'N/A', 20, 102);

    // Medicines
    let y = 120;
    doc.setFont('helvetica', 'bold');
    doc.text('Prescribed Medication:', 20, y);
    y += 10;
    doc.setFontSize(9);
    prescription.medicines.forEach((med, i) => {
      if (med.name) {
        doc.text(`${i + 1}. ${med.name} - ${med.dosage} (${med.frequency}) for ${med.duration}`, 25, y);
        y += 7;
        if (med.instructions) {
          doc.setFont('helvetica', 'italic');
          doc.text(`   Instruction: ${med.instructions}`, 25, y);
          doc.setFont('helvetica', 'normal');
          y += 7;
        }
      }
    });

    if (prescription.notes) {
      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Doctor\'s Notes:', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(prescription.notes, 20, y + 7);
    }

    doc.save(`RX_${patientName}_${today}.pdf`);
  };

  const frequencyOptions = [
    { value: 'once_daily', label: 'Once Daily' },
    { value: 'twice_daily', label: 'Twice Daily' },
    { value: 'three_times', label: 'Three Times Daily' },
    { value: 'as_needed', label: 'As Needed' },
  ];

  const durationOptions = [
    { value: '3_days', label: '3 Days' },
    { value: '5_days', label: '5 Days' },
    { value: '7_days', label: '7 Days' },
    { value: '14_days', label: '14 Days' },
    { value: '30_days', label: '30 Days' },
  ];

  if (loading) return <div className="p-8 text-center text-gray-500 italic">Accessing patient logs...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Prescription Terminal</h1>
          <p className="text-gray-500 font-medium">Issue digital medication slips securely.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={generatePDF}>
            <Printer className="w-5 h-5 mr-2" /> PDF Export
          </Button>
          <Button onClick={handleSave} loading={submitting}>
            <Save className="w-5 h-5 mr-2" /> Save to Database
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="!p-8 shadow-xl ring-1 ring-gray-100 border-none">
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Select
                  label="Target Patient *"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  options={patients.map(p => ({ value: p.id, label: p.name }))}
                  placeholder="Reference Patient Profile..."
                />
                <Input
                  label="Primary Diagnosis *"
                  placeholder="e.g. Acute Bronchitis"
                  value={prescription.diagnosis}
                  onChange={(e) => setPrescription(prev => ({ ...prev, diagnosis: e.target.value }))}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-widest">Medication Protocol</label>
                  <Button variant="secondary" size="sm" onClick={addMedicineRow} className="!py-1.5 rounded-lg border-primary-100 text-primary-600">
                    <Plus className="w-4 h-4 mr-2" /> New Row
                  </Button>
                </div>

                <div className="space-y-4">
                  {prescription.medicines.map((med, idx) => (
                    <div key={idx} className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100/50 relative group">
                      <button
                        onClick={() => removeMedicineRow(idx)}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-white text-danger border border-red-50 rounded-full shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="sm:col-span-2">
                          <Input placeholder="Medicine Name" value={med.name} onChange={(e) => updateMedicine(idx, 'name', e.target.value)} />
                        </div>
                        <div>
                          <Input placeholder="Dosage" value={med.dosage} onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)} />
                        </div>
                        <div>
                          <Select options={frequencyOptions} value={med.frequency} onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)} />
                        </div>
                        <div className="sm:col-span-2">
                          <Select options={durationOptions} value={med.duration} onChange={(e) => updateMedicine(idx, 'duration', e.target.value)} />
                        </div>
                        <div className="sm:col-span-2">
                          <Input placeholder="Special Instructions..." value={med.instructions} onChange={(e) => updateMedicine(idx, 'instructions', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-8 border-t border-gray-50">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Therapeutic Advice</label>
                <textarea
                  rows={4}
                  placeholder="Provide additional clinical advice or notes for the session..."
                  value={prescription.notes}
                  onChange={(e) => setPrescription(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-4 bg-gray-50/30 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none resize-none transition-all placeholder:text-gray-300 text-sm"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Preview */}
        <div className="space-y-6">
          <Card className="!p-0 overflow-hidden shadow-2xl ring-1 ring-gray-100 border-none bg-white">
            <div className="h-1.5 bg-gradient-to-r from-primary-500 to-medical-500" />
            <div className="p-8">
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-3xl flex items-center justify-center transition-transform hover:rotate-12 duration-300">
                  <FileText className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="mt-4 font-black text-gray-900 tracking-tighter">PREVIEW</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Digital Prescription Slip</p>
              </div>

              <div className="space-y-6 border-y border-gray-50 py-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-gray-300 uppercase leading-none mb-1">Doctor</p>
                    <p className="font-bold text-gray-900 leading-tight">Dr. {doctorData?.name || user?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-300 uppercase leading-none mb-1">Date</p>
                    <p className="font-bold text-gray-900 leading-tight">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-gray-300 uppercase leading-none mb-1">Patient</p>
                  <p className="font-bold text-gray-900 leading-tight">{patients.find(p => p.id === selectedPatient)?.name || 'Reference Required'}</p>
                </div>

                <div>
                  <p className="text-[10px] font-black text-gray-300 uppercase mb-2 leading-none">Status</p>
                  <Badge variant={prescription.diagnosis ? 'success' : 'gray'} className="w-full justify-center">
                    {prescription.diagnosis ? 'VALID DIAGNOSIS' : 'DRAFT'}
                  </Badge>
                </div>
              </div>

              <div className="mt-6 pt-6">
                <Button variant="secondary" className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" /> AI Review Record
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionManager;
