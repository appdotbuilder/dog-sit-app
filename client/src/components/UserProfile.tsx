import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
      case 'owner': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'sitter': return 'bg-green-50 text-green-700 border-green-200';
      case 'both': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
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
    <div className="space-y-8">
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-18 w-18 border border-slate-200">
                <AvatarImage src={user.profile_image_url || undefined} />
                <AvatarFallback className="bg-blue-50 text-blue-600 text-xl font-semibold">
                  {user.first_name[0]}{user.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <CardTitle className="text-xl font-semibold text-slate-900">
                  {user.first_name} {user.last_name}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={`${getRoleColor(user.role)} text-xs font-medium`}>
                    <span className="mr-1.5">{getRoleIcon(user.role)}</span>
                    {formatRole(user.role)}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="text-xs font-normal border-slate-200 text-slate-500"
                  >
                    Member since {user.created_at.getFullYear()}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant={isEditing ? "outline" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
              className={
                isEditing 
                  ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }
            >
              {isEditing ? (
                <>
                  <span className="mr-2">❌</span>
                  Cancel
                </>
              ) : (
                <>
                  <span className="mr-2">✏️</span>
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">First Name</label>
                  <Input
                    value={editData.first_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditData((prev) => ({ ...prev, first_name: e.target.value }))
                    }
                    className="border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Last Name</label>
                  <Input
                    value={editData.last_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditData((prev) => ({ ...prev, last_name: e.target.value }))
                    }
                    className="border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Phone Number</label>
                <Input
                  value={editData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="Enter your phone number"
                  className="border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Location</label>
                <Input
                  value={editData.location}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditData((prev) => ({ ...prev, location: e.target.value }))
                  }
                  placeholder="Enter your location"
                  className="border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Bio</label>
                <Textarea
                  value={editData.bio}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setEditData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <span className="mr-2">💾</span>
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel} 
                  className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="font-medium text-slate-700 flex items-center space-x-2">
                      <span className="w-4 h-4 text-sm">📧</span>
                      <span>Email</span>
                    </p>
                    <p className="text-slate-900 pl-6">{user.email}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-slate-700 flex items-center space-x-2">
                      <span className="w-4 h-4 text-sm">📞</span>
                      <span>Phone</span>
                    </p>
                    <p className="text-slate-900 pl-6">{user.phone || 'Not provided'}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-slate-700 flex items-center space-x-2">
                      <span className="w-4 h-4 text-sm">📍</span>
                      <span>Location</span>
                    </p>
                    <p className="text-slate-900 pl-6">{user.location || 'Not provided'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="font-medium text-slate-700 flex items-center space-x-2">
                      <span className="w-4 h-4 text-sm">👤</span>
                      <span>Account Type</span>
                    </p>
                    <div className="pl-6">
                      <Badge className={getRoleColor(user.role)}>
                        <span className="mr-1.5">{getRoleIcon(user.role)}</span>
                        {formatRole(user.role)}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-slate-700 flex items-center space-x-2">
                      <span className="w-4 h-4 text-sm">📅</span>
                      <span>Member Since</span>
                    </p>
                    <p className="text-slate-900 pl-6">{user.created_at.toLocaleDateString()}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-slate-700 flex items-center space-x-2">
                      <span className="w-4 h-4 text-sm">🔄</span>
                      <span>Last Updated</span>
                    </p>
                    <p className="text-slate-900 pl-6">{user.updated_at.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {user.bio && (
                <>
                  <Separator className="bg-slate-100" />
                  <div className="space-y-3">
                    <p className="font-medium text-slate-700 flex items-center space-x-2">
                      <span className="w-4 h-4 text-sm">📝</span>
                      <span>About Me</span>
                    </p>
                    <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
                      <p className="text-slate-700 leading-relaxed">
                        {user.bio}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
            <span className="w-5 h-5 text-lg">⚙️</span>
            <span>Account Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="justify-start h-auto py-3 border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <span className="mr-3 text-base">🔒</span>
              <span>Change Password</span>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start h-auto py-3 border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <span className="mr-3 text-base">🔔</span>
              <span>Notification Settings</span>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start h-auto py-3 border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <span className="mr-3 text-base">💳</span>
              <span>Payment Methods</span>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start h-auto py-3 border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <span className="mr-3 text-base">📊</span>
              <span>Privacy Settings</span>
            </Button>
          </div>
          
          <Separator className="bg-slate-100" />
          
          <div className="flex justify-between items-center bg-red-50 border border-red-100 rounded-md p-4">
            <div>
              <p className="font-medium text-red-900">Delete Account</p>
              <p className="text-sm text-red-600">Permanently delete your account and all data</p>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}