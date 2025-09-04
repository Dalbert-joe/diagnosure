import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Users, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getDoctorBookings, updateBookingStatus } = useAppData();

  const bookings = getDoctorBookings();

  // Calculate priority scores and sort bookings
  const prioritizedBookings = useMemo(() => {
    return bookings.map(booking => {
      // Calculate priority score using symptoms, urgency, and note
      let priorityScore = 0;
      
      // Base urgency score
      const urgencyScores = { critical: 100, high: 75, medium: 50, low: 25 };
      priorityScore += urgencyScores[booking.urgency as keyof typeof urgencyScores] || 25;
      
      // Analyze symptoms and note for severity keywords
      const allText = [...booking.symptoms, booking.note].join(' ').toLowerCase();
      
      // High severity keywords
      const highSeverityKeywords = ['severe', 'intense', 'unbearable', 'emergency', 'critical', 'chest pain', 'difficulty breathing', 'unconscious', 'bleeding heavily'];
      highSeverityKeywords.forEach(keyword => {
        if (allText.includes(keyword)) priorityScore += 15;
      });
      
      // Medium severity keywords  
      const mediumSeverityKeywords = ['moderate', 'persistent', 'ongoing', 'fever', 'pain', 'bleeding', 'dizzy', 'nausea'];
      mediumSeverityKeywords.forEach(keyword => {
        if (allText.includes(keyword)) priorityScore += 5;
      });
      
      // Duration indicators
      if (allText.includes('days') || allText.includes('weeks')) priorityScore += 10;
      if (allText.includes('sudden') || allText.includes('immediate')) priorityScore += 20;
      
      // Age factor (elderly get higher priority)
      if (booking.age >= 65) priorityScore += 10;
      if (booking.age <= 5) priorityScore += 15; // Children also get higher priority
      
      return {
        ...booking,
        priorityScore: Math.min(100, priorityScore)
      };
    }).sort((a, b) => b.priorityScore - a.priorityScore);
  }, [bookings]);

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'bg-destructive text-destructive-foreground';
    if (score >= 60) return 'bg-warning text-warning-foreground';
    if (score >= 40) return 'bg-info text-info-foreground';
    return 'bg-success text-success-foreground';
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
      <div className="bg-white shadow-soft border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-heading font-bold">Dr. {user?.name}'s Dashboard</h1>
            <p className="text-muted-foreground">{user?.hospitalName}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/'); }}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'pending').length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Critical Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{bookings.filter(b => b.urgency === 'critical').length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Patient Queue (Prioritized by Urgency)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prioritizedBookings.length > 0 ? (
              <div className="space-y-4">
                {prioritizedBookings.map((booking) => (
                  <Card key={booking.id} className={`border-l-4 ${
                    booking.priorityScore >= 80 ? 'border-l-destructive' :
                    booking.priorityScore >= 60 ? 'border-l-warning' :
                    booking.priorityScore >= 40 ? 'border-l-info' : 'border-l-success'
                  }`}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold">{booking.patientName}</h3>
                            <Badge className={getPriorityColor(booking.priorityScore)}>
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Priority: {booking.priorityScore}
                            </Badge>
                            <Badge className={getUrgencyColor(booking.urgency)}>
                              {booking.urgency.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{booking.status}</Badge>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <p><strong>Age:</strong> {booking.age} • <strong>Gender:</strong> {booking.gender}</p>
                              <p><strong>Date:</strong> {booking.date} • <strong>Slot:</strong> {booking.slot}</p>
                            </div>
                            <div>
                              <p><strong>Note:</strong> {booking.note}</p>
                            </div>
                          </div>
                          {booking.symptoms.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm"><strong>Symptoms:</strong> {booking.symptoms.join(', ')}</p>
                            </div>
                          )}
                          {booking.diagnosis && (
                            <div className="mt-2 p-2 bg-accent/30 rounded">
                              <p className="text-sm"><strong>AI Diagnosis:</strong> {booking.diagnosis}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {booking.status === 'pending' && (
                            <Button variant="outline" size="sm" onClick={() => updateBookingStatus(booking.id, 'confirmed')}>
                              Accept
                            </Button>
                          )}
                          <Button variant="medical" size="sm">
                            Chat
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No patients in queue</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorDashboard;