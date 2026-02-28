import { useNavigate } from 'react-router-dom';
import { ShieldOff, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const NotAuthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="w-10 h-10 text-danger" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-6">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 mr-2" /> Go Back
          </Button>
          <Button onClick={() => navigate('/')}>
            <Home className="w-5 h-5 mr-2" /> Go Home
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NotAuthorized;
