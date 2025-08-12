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
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-slate-300 bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-14 w-14 border border-slate-200">
            <AvatarImage src={dog.profile_image_url || undefined} />
            <AvatarFallback className="bg-amber-50 text-amber-600 text-xl border border-amber-200">
              {getSizeIcon(dog.size)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
              <span>{dog.name}</span>
              {!dog.is_active && (
                <Badge 
                  variant="secondary" 
                  className="bg-slate-100 text-slate-600 border-slate-200 text-xs"
                >
                  Inactive
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2 text-sm text-slate-500 mt-1">
              <span>{dog.breed || 'Mixed breed'}</span>
              <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
              <span>{getAgeText(dog.age)}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Size and Weight */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="font-medium text-slate-700">Size</p>
            <div className="flex items-center space-x-2">
              <span className="text-sm">{getSizeIcon(dog.size)}</span>
              <span className="text-slate-600">{formatSize(dog.size)}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-slate-700">Weight</p>
            <p className="text-slate-600">{dog.weight ? `${dog.weight} lbs` : 'Not specified'}</p>
          </div>
        </div>

        {/* Temperament */}
        <div className="space-y-2">
          <p className="font-medium text-slate-700 text-sm">Temperament</p>
          <div className="flex flex-wrap gap-1.5">
            {dog.temperament.map((trait, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs font-normal border-slate-200 text-slate-600 bg-slate-50"
              >
                <span className="mr-1.5 text-xs">{getTemperamentIcon(trait)}</span>
                {formatTemperament(trait)}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="bg-slate-100" />

        {/* Medical Notes */}
        {dog.medical_notes && (
          <div className="space-y-2">
            <p className="font-medium text-slate-700 text-sm flex items-center space-x-2">
              <span className="w-4 h-4 text-sm">🏥</span>
              <span>Medical Notes</span>
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
              <p className="text-slate-700 text-sm leading-relaxed">
                {dog.medical_notes}
              </p>
            </div>
          </div>
        )}

        {/* Special Instructions */}
        {dog.special_instructions && (
          <div className="space-y-2">
            <p className="font-medium text-slate-700 text-sm flex items-center space-x-2">
              <span className="w-4 h-4 text-sm">📝</span>
              <span>Special Instructions</span>
            </p>
            <div className="bg-green-50 border border-green-100 rounded-md p-3">
              <p className="text-slate-700 text-sm leading-relaxed">
                {dog.special_instructions}
              </p>
            </div>
          </div>
        )}

        <Separator className="bg-slate-100" />

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
          >
            <span className="mr-2 text-sm">✏️</span>
            Edit Profile
          </Button>
          <Button 
            variant={dog.is_active ? "outline" : "default"}
            className={
              dog.is_active 
                ? "px-4 border-slate-200 text-slate-700 hover:bg-slate-50"
                : "px-4 bg-green-600 hover:bg-green-700 text-white"
            }
          >
            <span className="mr-2 text-sm">{dog.is_active ? '⏸️' : '▶️'}</span>
            {dog.is_active ? 'Pause' : 'Activate'}
          </Button>
        </div>

        {/* Last Updated */}
        <p className="text-xs text-slate-400 text-center pt-2">
          Last updated: {dog.updated_at.toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}