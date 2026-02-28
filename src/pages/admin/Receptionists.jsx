import { useState, useEffect } from 'react';
import { Search, UserPlus, Edit, Trash2, Mail, Phone, Shield, ShieldCheck, UserX, UserMinus } from 'lucide-react';
import insforge from '../../api/insforge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';

const ReceptionistsList = () => {
    const [receptionists, setReceptionists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReceptionists();
    }, []);

    const fetchReceptionists = async () => {
        setLoading(true);
        try {
            // Find users in profiles with role 'receptionist'
            const { data } = await insforge.database
                .from('profiles')
                .select('*')
                .eq('role', 'receptionist')
                .order('name');

            setReceptionists(data || []);
        } catch (err) {
            console.error('Error fetching receptionists:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredStaff = receptionists.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const formData = new FormData(e.target);
        const staffData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            role: 'receptionist'
        };

        try {
            const { data: authData, error: authError } = await insforge.auth.signUp({
                email: staffData.email,
                password: staffData.password,
                name: staffData.name
            });

            if (authError) throw authError;

            const userId = authData.user.id;

            // Create Profile
            await insforge.database.from('profiles').insert([{
                id: userId,
                name: staffData.name,
                email: staffData.email,
                role: 'receptionist'
            }]);

            // Create Receptionist record
            const { error: dbError } = await insforge.database.from('receptionists').insert([{
                profile_id: userId,
                name: staffData.name,
                email: staffData.email,
                status: 'active'
            }]);

            if (dbError) throw dbError;

            setShowModal(false);
            fetchReceptionists();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 leading-none">Receptionist Management</h1>
                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Operational support staff directory</p>
                </div>
                <Button onClick={() => setShowModal(true)} className="!rounded-2xl shadow-lg shadow-primary-100">
                    <UserPlus className="w-5 h-5 mr-3" /> REGISTER NEW STAFF
                </Button>
            </div>

            <Card className="!p-4 bg-white/50 border-none shadow-sm ring-1 ring-gray-100 backdrop-blur-md">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none shadow-sm transition-all text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-gray-400 font-black italic">Accessing staff records...</div>
                ) : filteredStaff.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <UserX className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                        <p className="text-gray-500 font-black text-xl uppercase tracking-widest">No staff records found.</p>
                    </div>
                ) : (
                    filteredStaff.map((staff) => (
                        <Card key={staff.id} className="group !p-6 border-none shadow-md hover:shadow-2xl transition-all duration-300 ring-1 ring-gray-100 hover:ring-2 hover:ring-primary-100">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-indigo-400 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:rotate-6 transition-transform">
                                    {staff.name.charAt(0)}
                                </div>
                                <Badge variant="secondary" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border-none shadow-inner bg-gray-100 text-gray-500 italic">
                                    <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED ACCESS
                                </Badge>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-2">{staff.name}</h3>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                        <Mail className="w-3.5 h-3.5" /> {staff.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                        <Phone className="w-3.5 h-3.5" /> +1 000 000 0000
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                <div className="flex items-center gap-1">
                                    <button className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"><Edit className="w-5 h-5" /></button>
                                    <button className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><UserMinus className="w-5 h-5" /></button>
                                </div>
                                <Badge variant="primary" className="!bg-primary-50 !text-primary-600 border-none font-black text-[10px] uppercase tracking-tighter italic">ACTIVE SESSION</Badge>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Register Support Staff" size="md">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Input name="name" label="Full Name" placeholder="Receptionist Name" required />
                    <Input name="email" label="Email Address" type="email" placeholder="staff@clinic.com" required />
                    <Input name="password" label="Temporary Password" type="password" placeholder="••••••••" required />
                    <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex items-start gap-4">
                        <Shield className="w-6 h-6 text-primary-500 mt-1" />
                        <p className="text-xs font-bold text-primary-700 leading-relaxed italic">Registering a user here will grant them access to booking portals and patient records. Secure authorization required.</p>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" loading={submitting}>Register Staff</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ReceptionistsList;
