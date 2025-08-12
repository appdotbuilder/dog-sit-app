import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { Dog } from '../../../server/src/schema';

interface DogProfileProps {
  dog: Dog;
}

export function DogProfile({ dog }: DogProfileProps) {
  const getSizeIcon = (size: string) => {
    switch (size) {
      case 'small': return '🐕‍🦺';
      case 'medium': return '🐕';
      case 'large': return '🐕‍🦮';
      case 'extra_large': return '🦮';
      default: return '🐕';
    }
  };

  const getTemperamentIcon = (temperament: string) => {
    switch (temperament) {
      case 'calm': return '😌';
      case 'playful': return '🎾';
      case 'energetic': return '⚡';
      case 'aggressive': return '⚠️';
      case 'anxious': return '😰';
      case 'friendly': return '😊';
      default: return '🐕';
    }
  };

  const formatTemperament = (temperament: string) => {
    return temperament.charAt(0).toUpperCase() + temperament.slice(1);
  };

  const formatSize = (size: string) => {
    return size === 'extra_large' ? 'Extra Large' : 
           size.charAt(0).toUpperCase() + size.slice(1);
  };

  const getAgeText = (age: number) => {
    if (age === 1) return '1 year old';
    return `${age} years old`;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 border-3 border-orange-200">
            <AvatarImage src={dog.profile_image_url || undefined} />
            <AvatarFallback className="bg-gradient-to-r from-orange-400 to-pink-500 text-white text-2xl">
              {getSizeIcon(dog.size)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl flex items-center space-x-2">
              <span>{dog.name}</span>
              {!dog.is_active && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                  Inactive
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
              <span>{dog.breed || 'Mixed breed'}</span>
              <span>•</span>
              <span>{getAgeText(dog.age)}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Size and Weight */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="font-medium text-gray-700">Size</p>
            <div className="flex items-center space-x-2">
              <span>{getSizeIcon(dog.size)}</span>
              <span className="text-gray-600">{formatSize(dog.size)}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-700">Weight</p>
            <p className="text-gray-600">{dog.weight ? `${dog.weight} lbs` : 'Not specified'}</p>
          </div>
        </div>

        {/* Temperament */}
        <div className="space-y-2">
          <p className="font-medium text-gray-700 text-sm">Temperament</p>
          <div className="flex flex-wrap gap-1">
            {dog.temperament.map((trait, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <span className="mr-1">{getTemperamentIcon(trait)}</span>
                {formatTemperament(trait)}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Medical Notes */}
        {dog.medical_notes && (
          <div className="space-y-2">
            <p className="font-medium text-gray-700 text-sm flex items-center space-x-1">
              <span>🏥</span>
              <span>Medical Notes</span>
            </p>
            <p className="text-gray-600 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100">
              {dog.medical_notes}
            </p>
          </div>
        )}

        {/* Special Instructions */}
        {dog.special_instructions && (
          <div className="space-y-2">
            <p className="font-medium text-gray-700 text-sm flex items-center space-x-1">
              <span>📝</span>
              <span>Special Instructions</span>
            </p>
            <p className="text-gray-600 text-sm bg-green-50 p-3 rounded-lg border border-green-100">
              {dog.special_instructions}
            </p>
          </div>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1">
            ✏️ Edit Profile
          </Button>
          <Button 
            variant={dog.is_active ? "secondary" : "default"}
            className="px-4"
          >
            {dog.is_active ? '⏸️ Pause' : '▶️ Activate'}
          </Button>
        </div>

        {/* Last Updated */}
        <p className="text-xs text-gray-400 text-center">
          Last updated: {dog.updated_at.toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}