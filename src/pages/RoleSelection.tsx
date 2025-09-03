import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Stethoscope, Settings } from 'lucide-react';

const RoleSelection = () => {
  const navigate = useNavigate();

  const roles = [
    {
      title: 'Patient',
      description: 'Get AI-powered diagnosis and book appointments',
      icon: User,
      route: '/patient/login',
      color: 'gradient'
    },
    {
      title: 'Doctor',
      description: 'Manage patient queue and consultations',
      icon: Stethoscope,
      route: '/doctor/login',
      color: 'medical'
    },
    {
      title: 'Admin',
      description: 'System administration and oversight',
      icon: Settings,
      route: '/admin/dashboard',
      color: 'secondary'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-card flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            Welcome to Diagnosure
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your role to continue. Whether you're seeking medical advice or providing healthcare services, we've got you covered.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <Card 
                key={role.title} 
                className="hover:shadow-card transition-smooth cursor-pointer transform hover:scale-105"
                onClick={() => navigate(role.route)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-heading">{role.title}</CardTitle>
                  <CardDescription className="text-base">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    variant={role.color as any}
                    size="lg" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(role.route);
                    }}
                  >
                    Continue as {role.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Demo Accounts */}
        <div className="mt-12 p-6 bg-accent/50 rounded-lg text-center">
          <h3 className="font-heading font-semibold mb-2">Demo Accounts</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try the app with these demo credentials:
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-background p-3 rounded">
              <strong>Patient:</strong> patient@demo.com / demo123
            </div>
            <div className="bg-background p-3 rounded">
              <strong>Doctor:</strong> doctor@demo.com / demo123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;