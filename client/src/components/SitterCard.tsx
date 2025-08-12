import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { SitterListing } from '../../../server/src/schema';

interface SitterCardProps {
  sitter: SitterListing;
}

export function SitterCard({ sitter }: SitterCardProps) {
  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'dog_walking': return '🚶';
      case 'pet_sitting': return '🏡';
      case 'daycare': return '🎾';
      case 'overnight_care': return '🌙';
      case 'grooming': return '✨';
      default: return '🐕';
    }
  };

  const getSizeIcon = (size: string) => {
    switch (size) {
      case 'small': return '🐕‍🦺';
      case 'medium': return '🐕';
      case 'large': return '🐕‍🦮';
      case 'extra_large': return '🦮';
      default: return '🐕';
    }
  };

  const formatServiceName = (service: string) => {
    return service.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatSizeName = (size: string) => {
    return size === 'extra_large' ? 'XL' : 
           size.charAt(0).toUpperCase() + size.slice(1);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 border-2 border-blue-200">
              <AvatarImage src={undefined} />
              <AvatarFallback className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-lg">
                🐕
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg leading-tight">{sitter.title}</CardTitle>
              <p className="text-sm text-gray-600 flex items-center space-x-1">
                <span>📍</span>
                <span>{sitter.location}</span>
              </p>
            </div>
          </div>
          {sitter.has_insurance && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              🛡️ Insured
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-700 text-sm leading-relaxed">{sitter.description}</p>

        {/* Services Offered */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800 text-sm">Services</h4>
          <div className="flex flex-wrap gap-1">
            {sitter.services_offered.map((service) => (
              <Badge key={service} variant="outline" className="text-xs">
                <span className="mr-1">{getServiceIcon(service)}</span>
                {formatServiceName(service)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Dog Sizes */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800 text-sm">Accepts</h4>
          <div className="flex flex-wrap gap-1">
            {sitter.accepts_sizes.map((size) => (
              <Badge key={size} variant="outline" className="text-xs">
                <span className="mr-1">{getSizeIcon(size)}</span>
                {formatSizeName(size)}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Pricing and Details */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-semibold text-gray-800">${sitter.price_per_hour}/hour</p>
              {sitter.price_per_day && (
                <p className="text-gray-600">${sitter.price_per_day}/day</p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-gray-600">⭐ {sitter.experience_years} years exp</p>
              <p className="text-gray-600">🐕 Up to {sitter.max_dogs} dogs</p>
            </div>
          </div>

          {/* Additional Features */}
          <div className="flex items-center space-x-4 text-xs text-gray-600">
            {sitter.has_yard && (
              <div className="flex items-center space-x-1">
                <span>🏡</span>
                <span>Yard</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <span>📍</span>
              <span>{sitter.radius_km}km radius</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
            Book Now
          </Button>
          <Button variant="outline" className="px-3">
            💬
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}