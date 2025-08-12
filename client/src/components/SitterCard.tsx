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
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-slate-300 bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-11 w-11 border border-slate-200">
              <AvatarImage src={undefined} />
              <AvatarFallback className="bg-blue-50 text-blue-600 text-sm font-medium">
                PS
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 leading-tight">
                {sitter.title}
              </CardTitle>
              <p className="text-sm text-slate-500 flex items-center space-x-1 mt-1">
                <span className="w-3 h-3 text-xs">📍</span>
                <span>{sitter.location}</span>
              </p>
            </div>
          </div>
          {sitter.has_insurance && (
            <Badge 
              variant="secondary" 
              className="bg-green-50 text-green-700 border-green-200 text-xs font-medium px-2 py-1"
            >
              Insured
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
          {sitter.description}
        </p>

        {/* Services Offered */}
        <div className="space-y-2">
          <h4 className="font-medium text-slate-800 text-sm">Services</h4>
          <div className="flex flex-wrap gap-1.5">
            {sitter.services_offered.map((service) => (
              <Badge 
                key={service} 
                variant="outline" 
                className="text-xs font-normal border-slate-200 text-slate-600 bg-slate-50"
              >
                <span className="mr-1.5 text-xs">{getServiceIcon(service)}</span>
                {formatServiceName(service)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Dog Sizes */}
        <div className="space-y-2">
          <h4 className="font-medium text-slate-800 text-sm">Dog Sizes</h4>
          <div className="flex flex-wrap gap-1.5">
            {sitter.accepts_sizes.map((size) => (
              <Badge 
                key={size} 
                variant="outline" 
                className="text-xs font-normal border-slate-200 text-slate-600 bg-slate-50"
              >
                <span className="mr-1.5 text-xs">{getSizeIcon(size)}</span>
                {formatSizeName(size)}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="bg-slate-100" />

        {/* Pricing and Details */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex items-baseline space-x-1">
                <span className="text-lg font-semibold text-slate-900">
                  ${sitter.price_per_hour}
                </span>
                <span className="text-slate-500 text-xs">/hour</span>
              </div>
              {sitter.price_per_day && (
                <p className="text-slate-600 text-xs">
                  ${sitter.price_per_day}/day
                </p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-slate-600 text-xs flex items-center">
                <span className="w-3 h-3 mr-1.5">⭐</span>
                {sitter.experience_years} years
              </p>
              <p className="text-slate-600 text-xs flex items-center">
                <span className="w-3 h-3 mr-1.5">🐕</span>
                Up to {sitter.max_dogs} dogs
              </p>
            </div>
          </div>

          {/* Additional Features */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-xs text-slate-500">
              {sitter.has_yard && (
                <div className="flex items-center space-x-1">
                  <span className="w-3 h-3">🏡</span>
                  <span>Yard</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <span className="w-3 h-3">📍</span>
                <span>{sitter.radius_km}km radius</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-100" />

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
            Book Now
          </Button>
          <Button 
            variant="outline" 
            className="px-4 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
          >
            <span className="text-sm">💬</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}