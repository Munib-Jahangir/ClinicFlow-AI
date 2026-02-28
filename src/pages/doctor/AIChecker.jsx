import { useState } from 'react';
import { Brain, AlertTriangle, TestTube, FileText, Copy, CheckCircle, XCircle, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { sendChatMessage } from '../../api/ai';

const AISymptomChecker = () => {
  const [formData, setFormData] = useState({
    symptoms: '',
    age: '',
    gender: '',
    history: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showFallback, setShowFallback] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const analyzeSymptoms = async (e) => {
    e.preventDefault();
    if (!formData.symptoms || !formData.age || !formData.gender) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setShowFallback(false);

    const prompt = `You are a clinical decision support assistant. A doctor is consulting you. Patient: Age ${formData.age}, Gender ${formData.gender}. Symptoms: ${formData.symptoms}. Relevant History: ${formData.history || 'None'}. Respond ONLY in JSON format with no additional text: {"conditions":[{"name":"...","probability":"..."}],"risk_level":"low|medium|high|critical","suggested_tests":["..."],"notes":"..."}`;

    try {
      const response = await sendChatMessage(
        prompt,
        null,
        (text) => {
          try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              setResult(parsed);
            } else {
              throw new Error('No JSON found');
            }
          } catch (parseError) {
            setResult({
              conditions: [{ name: 'Analysis in Progress', probability: 'Processing...' }],
              risk_level: 'unknown',
              suggested_tests: [],
              notes: text,
              raw_response: true,
            });
          }
        },
        (err) => {
          throw err;
        }
      );
    } catch (err) {
      console.error('AI Error:', err);
      setError('AI service is currently unavailable. Please use manual diagnosis.');
      setShowFallback(true);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    }
  };

  const riskColors = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
    critical: 'danger',
    unknown: 'gray',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-medical-500 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Symptom Checker</h1>
            <p className="text-gray-500">AI-powered clinical decision support</p>
          </div>
        </div>
        <Badge variant="medical" className="text-sm px-3 py-1">
          <Sparkles className="w-4 h-4 mr-1" /> AI Powered
        </Badge>
      </div>

      {/* AI Fallback Banner */}
      {showFallback && (
        <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">AI Unavailable</p>
            <p className="text-sm text-amber-700">You can proceed with manual diagnosis. The AI service is temporarily unavailable.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card title="Patient Symptoms" subtitle="Enter symptom details for AI analysis">
          <form onSubmit={analyzeSymptoms} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Patient Age *"
                type="number"
                placeholder="35"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                required
              />
              <Select
                label="Gender *"
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Symptoms *
              </label>
              <textarea
                rows={4}
                placeholder="Describe the patient's symptoms in detail..."
                value={formData.symptoms}
                onChange={(e) => handleChange('symptoms', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Medical History
              </label>
              <textarea
                rows={3}
                placeholder="Any relevant medical history, current medications, allergies..."
                value={formData.history}
                onChange={(e) => handleChange('history', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              {loading ? (
                <>Analyzing...</>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-2" /> Analyze with AI
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Results */}
        <Card 
          title="AI Analysis Results" 
          subtitle="AI-generated recommendations"
          action={
            result && (
              <button
                onClick={copyToClipboard}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
            )
          }
        >
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Brain className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500">Enter patient symptoms and click analyze to get AI recommendations</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Analyzing symptoms...</p>
              <p className="text-sm text-gray-400">This may take a few seconds</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Risk Level */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-6 h-6 ${result.risk_level === 'high' || result.risk_level === 'critical' ? 'text-danger' : result.risk_level === 'medium' ? 'text-warning' : 'text-success'}`} />
                  <span className="font-medium text-gray-900">Risk Level</span>
                </div>
                <Badge variant={riskColors[result.risk_level] || 'default'} className="text-lg px-4 py-1">
                  {result.risk_level?.toUpperCase() || 'UNKNOWN'}
                </Badge>
              </div>

              {/* Conditions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-500" />
                  Possible Conditions
                </h4>
                <div className="space-y-2">
                  {result.conditions?.map((condition, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl">
                      <span className="font-medium text-gray-900">{condition.name}</span>
                      <Badge variant={condition.probability === 'High' ? 'danger' : condition.probability === 'Medium' ? 'warning' : 'success'}>
                        {condition.probability || 'N/A'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Tests */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-medical-500" />
                  Suggested Tests
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.suggested_tests?.map((test, idx) => (
                    <Badge key={idx} variant="medical" className="text-sm">
                      {test}
                    </Badge>
                  ))}
                  {(!result.suggested_tests || result.suggested_tests.length === 0) && (
                    <p className="text-sm text-gray-500">No specific tests recommended</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              {result.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Clinical Notes</h4>
                  <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
                    <p className="text-sm text-primary-800 whitespace-pre-wrap">{result.notes}</p>
                  </div>
                </div>
              )}

              {/* Add to Prescription */}
              <Button className="w-full" variant="secondary">
                <FileText className="w-5 h-5 mr-2" /> Add to Prescription
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AISymptomChecker;
