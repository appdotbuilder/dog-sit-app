import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { User, UserRole } from '../../../server/src/schema';

interface UserProfileProps {
  user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone || '',
    location: user.location || '',
    bio: user.bio || ''
  });

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'owner': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sitter': return 'bg-green-100 text-green-800 border-green-200';
      case 'both': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'owner': return '🏠';
      case 'sitter': return '🐕‍🦮';
      case 'both': return '🤝';
      default: return '👤';
    }
  };

  const formatRole = (role: UserRole) => {
    if (role === 'both') return 'Owner & Sitter';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleSave = async () => {
    try {
      // STUB: This would normally call the real API
      // await trpc.updateUser.mutate({
      //   id: user.id,
      //   ...editData,
      //   phone: editData.phone || null,
      //   location: editData.location || null,
      //   bio: editData.bio || null
      // });
      console.log('Profile updated:', editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setEditData({
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-4 border-blue-200">
                <AvatarImage src={user.profile_image_url || undefined} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl">
                  {user.first_name[0]}{user.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <CardTitle className="text-2xl">
                  {user.first_name} {user.last_name}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getRoleColor(user.role)}>
                    <span className="mr-1">{getRoleIcon(user.role)}</span>
                    {formatRole(user.role)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Member since {user.created_at.getFullYear()}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant={isEditing ? "secondary" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? '❌ Cancel' : '✏️ Edit Profile'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">First Name</label>
                  <Input
                    value={editData.first_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditData((prev) => ({ ...prev, first_name: e.target.value }))
                    }
                    className="bg-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <Input
                    value={editData.last_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditData((prev) => ({ ...prev, last_name: e.target.value }))
                    }
                    className="bg-white/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <Input
                  value={editData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="Enter your phone number"
                  className="bg-white/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Location</label>
                <Input
                  value={editData.location}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditData((prev) => ({ ...prev, location: e.target.value }))
                  }
                  placeholder="Enter your location"
                  className="bg-white/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Bio</label>
                <Textarea
                  value={editData.bio}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setEditData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="bg-white/50"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  💾 Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="font-medium text-gray-700 flex items-center space-x-2">
                      <span>📧</span>
                      <span>Email</span>
                    </p>
                    <p className="text-gray-600">{user.email}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-gray-700 flex items-center space-x-2">
                      <span>📞</span>
                      <span>Phone</span>
                    </p>
                    <p className="text-gray-600">{user.phone || 'Not provided'}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-gray-700 flex items-center space-x-2">
                      <span>📍</span>
                      <span>Location</span>
                    </p>
                    <p className="text-gray-600">{user.location || 'Not provided'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="font-medium text-gray-700 flex items-center space-x-2">
                      <span>👤</span>
                      <span>Account Type</span>
                    </p>
                    <Badge className={getRoleColor(user.role)}>
                      <span className="mr-1">{getRoleIcon(user.role)}</span>
                      {formatRole(user.role)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-gray-700 flex items-center space-x-2">
                      <span>📅</span>
                      <span>Member Since</span>
                    </p>
                    <p className="text-gray-600">{user.created_at.toLocaleDateString()}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-gray-700 flex items-center space-x-2">
                      <span>🔄</span>
                      <span>Last Updated</span>
                    </p>
                    <p className="text-gray-600">{user.updated_at.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {user.bio && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="font-medium text-gray-700 flex items-center space-x-2">
                      <span>📝</span>
                      <span>About Me</span>
                    </p>
                    <p className="text-gray-600 leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-100">
                      {user.bio}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>⚙️</span>
            <span>Account Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              🔒 Change Password
            </Button>
            <Button variant="outline" className="justify-start">
              🔔 Notification Settings
            </Button>
            <Button variant="outline" className="justify-start">
              💳 Payment Methods
            </Button>
            <Button variant="outline" className="justify-start">
              📊 Privacy Settings
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-700">Delete Account</p>
              <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}