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
  const { addBooking, symptoms } = useAppData();
  
  const [formData, setFormData] = useState({
    hospitalName: '',
    hospitalAddress: '',
    slot: '',
    date: '',
    note: ''
  });

  const mockHospitals = [
    { name: 'City General Hospital', address: '123 Main St, Chennai, TN 600001' },
    { name: 'Apollo Health Center', address: '456 Park Ave, Chennai, TN 600002' },
    { name: 'Fortis Medical Center', address: '789 Health Blvd, Chennai, TN 600003' },
    { name: 'Max Super Specialty', address: '321 Care St, Chennai, TN 600004' }
  ];

  const timeSlots = ['Morning (9AM-12PM)', 'Afternoon (1PM-4PM)', 'Evening (5PM-8PM)', 'Night (8PM-11PM)'];

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
      urgency: 'medium' as const,
      symptoms: symptoms.map(s => s.text)
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

              <Button type="submit" variant="gradient" size="lg" className="w-full">
                <Calendar className="w-5 h-5 mr-2" />
                Confirm Appointment
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HospitalBooking;