import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, FileText, Calendar, User, LogOut, AlertTriangle } from 'lucide-react';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { bookings, diagnoses } = useAppData();

  const userBookings = bookings.filter(booking => booking.patientId === user?.id);
  const recentDiagnoses = diagnoses.slice(-3);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-info text-info-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-card">
      {/* Header */}
      <div className="bg-white shadow-soft border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-heading font-bold">Welcome back, {user?.name}!</h1>
            <p className="text-muted-foreground">Your health dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/patient/profile')}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-card transition-smooth cursor-pointer" onClick={() => navigate('/patient/chatbot')}>
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-3">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">AI Health Chat</CardTitle>
              <CardDescription>
                Describe your symptoms and get instant AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="gradient" className="w-full">
                Start Consultation
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-smooth cursor-pointer" onClick={() => navigate('/patient/booking')}>
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">Book Appointment</CardTitle>
              <CardDescription>
                Find nearby hospitals and schedule visits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="medical" className="w-full">
                Book Now
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-smooth cursor-pointer" onClick={() => navigate('/patient/diagnosis')}>
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">View Diagnoses</CardTitle>
              <CardDescription>
                Review your medical analysis and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Results
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Recent Appointments
              </CardTitle>
              <CardDescription>Your upcoming and past appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {userBookings.length > 0 ? (
                <div className="space-y-4">
                  {userBookings.slice(-3).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
                      <div>
                        <p className="font-medium">{booking.hospitalName}</p>
                        <p className="text-sm text-muted-foreground">{booking.date} • {booking.slot}</p>
                        <p className="text-xs text-muted-foreground mt-1">{booking.note}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                        <Badge className={getUrgencyColor(booking.urgency)}>
                          {booking.urgency}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No appointments yet</p>
                  <Button 
                    variant="gradient" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => navigate('/patient/chatbot')}
                  >
                    Start with AI Chat
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Diagnoses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Recent Diagnoses
              </CardTitle>
              <CardDescription>AI-powered medical analysis results</CardDescription>
            </CardHeader>
            <CardContent>
              {recentDiagnoses.length > 0 ? (
                <div className="space-y-4">
                  {recentDiagnoses.map((diagnosis) => (
                    <div key={diagnosis.id} className="p-4 bg-accent/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{diagnosis.condition}</p>
                        <Badge className={getUrgencyColor(diagnosis.urgency)}>
                          {diagnosis.probability}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{diagnosis.reasoning}</p>
                      {diagnosis.doctorRecommended && (
                        <div className="flex items-center mt-2 text-warning">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          <span className="text-sm">Doctor consultation recommended</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No diagnoses yet</p>
                  <Button 
                    variant="gradient" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => navigate('/patient/chatbot')}
                  >
                    Get AI Diagnosis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Emergency SOS */}
        <Card className="mt-8 border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Emergency Services
            </CardTitle>
            <CardDescription>
              In case of medical emergency, click the button below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="emergency" size="lg" className="w-full md:w-auto">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Emergency SOS
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;