import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Settings, Users, Activity, BarChart3 } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-card">
      <div className="bg-white shadow-soft border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate('/role-selection')} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-heading font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">System administration and oversight</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-card transition-smooth cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Manage patients and doctors</p>
              <Button variant="outline" className="w-full">
                Manage Users
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-smooth cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-3">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <CardTitle>System Monitor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Monitor system health and performance</p>
              <Button variant="outline" className="w-full">
                View Metrics
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-smooth cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-3">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">View usage statistics and reports</p>
              <Button variant="outline" className="w-full">
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;