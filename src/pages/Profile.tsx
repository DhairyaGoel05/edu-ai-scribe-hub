
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, Calendar, Upload, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const { profile, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    age: 0,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || profile.name || '',
        phone_number: profile.phone_number || '',
        age: profile.age || 0,
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile({
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        age: formData.age,
        name: formData.full_name
      });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || profile.name || '',
        phone_number: profile.phone_number || '',
        age: profile.age || 0,
      });
    }
    setIsEditing(false);
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const displayName = profile.full_name || profile.name || 'User';
  const isInstructor = profile.role === 'INSTRUCTOR';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="flex items-center space-x-2 dark:text-gray-300 dark:hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>
          <Button variant="outline" onClick={logout} className="dark:border-gray-600 dark:text-gray-300 dark:hover:text-white">
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="md:col-span-1">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-2xl dark:bg-gray-700 dark:text-white">
                    {displayName.charAt(0)?.toUpperCase() || profile.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl dark:text-white">{displayName}</CardTitle>
                <CardDescription className="dark:text-gray-300">{profile.email}</CardDescription>
                <Badge variant={isInstructor ? 'default' : 'secondary'} className="mt-2">
                  {isInstructor ? 'Instructor' : 'Student'}
                </Badge>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full dark:border-gray-600 dark:text-gray-300" disabled>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="md:col-span-2">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="dark:text-white">Profile Information</CardTitle>
                    <CardDescription className="dark:text-gray-300">Manage your personal details</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="space-x-2">
                      <Button variant="outline" onClick={handleCancel} className="dark:border-gray-600 dark:text-gray-300">
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="flex items-center space-x-2 dark:text-gray-200">
                      <User className="w-4 h-4" />
                      <span>Full Name</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 font-medium">{displayName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age" className="flex items-center space-x-2 dark:text-gray-200">
                      <Calendar className="w-4 h-4" />
                      <span>Age</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 font-medium">{profile.age || 'Not set'}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center space-x-2 dark:text-gray-200">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </Label>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{profile.email}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number" className="flex items-center space-x-2 dark:text-gray-200">
                    <Phone className="w-4 h-4" />
                    <span>Phone Number</span>
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone_number"
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-gray-100 font-medium">{profile.phone_number || 'Not set'}</p>
                  )}
                </div>

                <div className="pt-4 border-t dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-2 dark:text-white">Account Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="dark:text-gray-200">Role</Label>
                      <p className="text-gray-900 dark:text-gray-100 font-medium capitalize">{profile.role.toLowerCase()}</p>
                    </div>
                    <div>
                      <Label className="dark:text-gray-200">Member Since</Label>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">
                        {profile.createdAt || profile.created_at ? new Date(profile.createdAt || profile.created_at!).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
