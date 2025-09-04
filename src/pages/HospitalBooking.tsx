import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MapPin, Calendar, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const HospitalBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addBooking, symptoms, diagnoses } = useAppData();
  
  const [formData, setFormData] = useState({
    hospitalName: '',
    hospitalAddress: '',
    slot: '',
    date: '',
    note: ''
  });

  // Determine urgency from AI diagnosis if available
  const getBookingUrgency = () => {
    if (diagnoses.length === 0) return 'medium';
    
    // Use the highest urgency from all diagnoses
    const urgencyLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    const maxUrgency = diagnoses.reduce((max, diagnosis) => {
      const currentLevel = urgencyLevels[diagnosis.urgency];
      return currentLevel > max ? currentLevel : max;
    }, 0);
    
    const urgencyMap = { 1: 'low', 2: 'medium', 3: 'high', 4: 'critical' };
    return urgencyMap[maxUrgency as keyof typeof urgencyMap] || 'medium';
  };

  // Get primary diagnosis for booking
  const getPrimaryDiagnosis = () => {
    if (diagnoses.length === 0) return undefined;
    return `${diagnoses[0].condition} (${diagnoses[0].probability}% probability)`;
  };

  const mockHospitals = [
    { name: 'City General Hospital', address: '123 Main St, Chennai, TN 600001' },
    { name: 'Apollo Health Center', address: '456 Park Ave, Chennai, TN 600002' },
    { name: 'Fortis Medical Center', address: '789 Health Blvd, Chennai, TN 600003' },
    { name: 'Max Super Specialty', address: '321 Care St, Chennai, TN 600004' }
  ];

  const timeSlots = ['Morning (9AM-12PM)', 'Afternoon (1PM-4PM)', 'Evening (5PM-8PM)', 'Night (8PM-11PM)'];

  const handleEmergencySOS = () => {
    // Get user location and create emergency booking
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const emergencyBooking = {
          patientId: user!.id,
          patientName: user!.name,
          age: user!.age || 0,
          gender: user!.gender || 'not specified',
          hospitalName: 'Emergency Services',
          hospitalAddress: `Location: ${position.coords.latitude}, ${position.coords.longitude}`,
          slot: 'Emergency',
          date: new Date().toISOString().split('T')[0],
          note: `EMERGENCY SOS - Immediate medical attention required. Location: Lat ${position.coords.latitude}, Lng ${position.coords.longitude}. Symptoms: ${symptoms.map(s => s.text).join(', ')}`,
          status: 'pending' as const,
          urgency: 'critical' as const,
          symptoms: symptoms.map(s => s.text),
          diagnosis: getPrimaryDiagnosis()
        };
        
        addBooking(emergencyBooking);
        
        toast({
          title: "Emergency SOS Activated!",
          description: "Emergency services have been notified. Help is on the way.",
          variant: "destructive"
        });
      }, () => {
        // Fallback without location
        const emergencyBooking = {
          patientId: user!.id,
          patientName: user!.name,
          age: user!.age || 0,
          gender: user!.gender || 'not specified',
          hospitalName: 'Emergency Services',
          hospitalAddress: 'Location not available',
          slot: 'Emergency',
          date: new Date().toISOString().split('T')[0],
          note: `EMERGENCY SOS - Immediate medical attention required. Symptoms: ${symptoms.map(s => s.text).join(', ')}`,
          status: 'pending' as const,
          urgency: 'critical' as const,
          symptoms: symptoms.map(s => s.text),
          diagnosis: getPrimaryDiagnosis()
        };
        
        addBooking(emergencyBooking);
        
        toast({
          title: "Emergency SOS Activated!",
          description: "Emergency services have been notified.",
          variant: "destructive"
        });
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.hospitalName || !formData.slot || !formData.date || !formData.note.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including the note.",
        variant: "destructive"
      });
      return;
    }

    const booking = {
      patientId: user!.id,
      patientName: user!.name,
      age: user!.age || 0,
      gender: user!.gender || 'not specified',
      hospitalName: formData.hospitalName,
      hospitalAddress: formData.hospitalAddress,
      slot: formData.slot,
      date: formData.date,
      note: formData.note,
      status: 'pending' as const,
      urgency: getBookingUrgency() as 'low' | 'medium' | 'high' | 'critical',
      symptoms: symptoms.map(s => s.text),
      diagnosis: getPrimaryDiagnosis()
    };

    addBooking(booking);
    
    toast({
      title: "Appointment Booked!",
      description: "Your appointment has been scheduled successfully.",
    });
    
    navigate('/patient/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-card">
      <div className="bg-white shadow-soft border-b px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate('/patient/dashboard')} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-xl font-heading font-semibold">Book Hospital Appointment</h1>
            <p className="text-sm text-muted-foreground">Schedule your visit with a healthcare provider</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Select Hospital *</Label>
                <Select onValueChange={(value) => {
                  const hospital = mockHospitals.find(h => h.name === value);
                  setFormData({
                    ...formData, 
                    hospitalName: value,
                    hospitalAddress: hospital?.address || ''
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockHospitals.map((hospital) => (
                      <SelectItem key={hospital.name} value={hospital.name}>
                        <div>
                          <div className="font-medium">{hospital.name}</div>
                          <div className="text-xs text-muted-foreground">{hospital.address}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Preferred Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Time Slot *</Label>
                  <Select onValueChange={(value) => setFormData({...formData, slot: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {slot}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Medical Note / Reason for Visit *</Label>
                <Textarea
                  id="note"
                  placeholder="Please describe your symptoms, concerns, or reason for the visit..."
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  required
                  rows={4}
                />
              </div>

              {diagnoses.length > 0 && (
                <div className="p-4 bg-accent/30 rounded-lg">
                  <h4 className="font-medium mb-2">AI Diagnosis Results</h4>
                  <div className="text-sm space-y-2">
                    <p><strong>Primary Condition:</strong> {diagnoses[0].condition} ({diagnoses[0].probability}%)</p>
                    <p><strong>Urgency Level:</strong> <span className={`font-medium ${
                      getBookingUrgency() === 'critical' ? 'text-destructive' :
                      getBookingUrgency() === 'high' ? 'text-warning' : 'text-muted-foreground'
                    }`}>{getBookingUrgency().toUpperCase()}</span></p>
                    {diagnoses[0].doctorRecommended && (
                      <p className="text-warning"><strong>⚠️ Doctor consultation recommended</strong></p>
                    )}
                  </div>
                </div>
              )}

              {symptoms.length > 0 && (
                <div className="p-4 bg-accent/30 rounded-lg">
                  <h4 className="font-medium mb-2">Your Recorded Symptoms</h4>
                  <ul className="text-sm space-y-1">
                    {symptoms.slice(0, 3).map((symptom, index) => (
                      <li key={index} className="text-muted-foreground">• {symptom.text}</li>
                    ))}
                    {symptoms.length > 3 && (
                      <li className="text-muted-foreground">• ... and {symptoms.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex space-x-4">
                <Button type="submit" variant="gradient" size="lg" className="flex-1">
                  <Calendar className="w-5 h-5 mr-2" />
                  Confirm Appointment
                </Button>
                
                <Button 
                  type="button" 
                  variant="emergency" 
                  size="lg"
                  onClick={handleEmergencySOS}
                  className="px-6"
                >
                  🚨 Emergency SOS
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HospitalBooking;