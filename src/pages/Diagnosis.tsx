import { useNavigate } from 'react-router-dom';
import { useAppData } from '@/contexts/AppDataContext';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertTriangle, Calendar } from 'lucide-react';

const Diagnosis = () => {
  const navigate = useNavigate();
  const { diagnoses } = useAppData();

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
      <div className="bg-white shadow-soft border-b px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => navigate('/patient/dashboard')} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-heading font-semibold">AI Diagnosis Results</h1>
              <p className="text-sm text-muted-foreground">Medical analysis based on your symptoms</p>
            </div>
          </div>
          <Button variant="medical" onClick={() => navigate('/patient/booking')}>
            <Calendar className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {diagnoses.length > 0 ? (
          <div className="space-y-6">
            {diagnoses.map((diagnosis, index) => (
              <Card key={diagnosis.id} className="hover:shadow-card transition-smooth">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">#{index + 1} {diagnosis.condition}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={getUrgencyColor(diagnosis.urgency)}>
                        {diagnosis.urgency.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{diagnosis.probability}% probability</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-4">
                    {diagnosis.reasoning}
                  </CardDescription>
                  {diagnosis.doctorRecommended && (
                    <div className="flex items-center p-3 bg-warning/10 rounded-lg border border-warning/20">
                      <AlertTriangle className="w-5 h-5 text-warning mr-3" />
                      <span className="text-sm font-medium">Doctor consultation recommended for this condition</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            <Card className="bg-gradient-card border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="font-heading font-semibold text-lg">Ready to see a doctor?</h3>
                  <p className="text-muted-foreground">Book an appointment with a qualified physician for proper diagnosis and treatment.</p>
                  <Button variant="gradient" size="lg" onClick={() => navigate('/patient/booking')}>
                    <Calendar className="w-5 h-5 mr-2" />
                    Schedule Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-heading font-semibold text-lg mb-2">No Diagnosis Available</h3>
                <p className="text-muted-foreground mb-6">Start a chat with our AI to get your symptoms analyzed.</p>
                <Button variant="gradient" onClick={() => navigate('/patient/chatbot')}>
                  Start AI Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Diagnosis;