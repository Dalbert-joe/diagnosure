import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, Save } from 'lucide-react';

const PatientProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

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
              <h1 className="text-xl font-heading font-semibold">Profile Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your personal information</p>
            </div>
          </div>
          <Button variant={isEditing ? "gradient" : "outline"} onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? <Save className="w-4 h-4 mr-2" /> : <User className="w-4 h-4 mr-2" />}
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input value={user?.name || ''} disabled={!isEditing} />
              </div>
              <div>
                <Label>Age</Label>
                <Input value={user?.age || ''} disabled={!isEditing} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Gender</Label>
                <Input value={user?.gender || ''} disabled={!isEditing} />
              </div>
              <div>
                <Label>City</Label>
                <Input value={user?.city || ''} disabled={!isEditing} />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled />
            </div>
            <div>
              <Label>Preferred Language</Label>
              <Input value={user?.preferredLanguage || ''} disabled={!isEditing} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientProfile;