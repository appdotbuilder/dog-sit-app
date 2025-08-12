import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ServiceType, DogSize } from '../../../server/src/schema';

interface FilterState {
  serviceType: ServiceType | 'all';
  dogSize: DogSize | 'all';
  maxPrice: number;
  hasYard: boolean;
  hasInsurance: boolean;
  minExperience: number;
}

export function SearchFilters() {
  const [filters, setFilters] = useState<FilterState>({
    serviceType: 'all',
    dogSize: 'all',
    maxPrice: 100,
    hasYard: false,
    hasInsurance: false,
    minExperience: 0
  });

  const [showFilters, setShowFilters] = useState(false);

  const serviceTypes: { value: ServiceType | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All Services', icon: '🏠' },
    { value: 'dog_walking', label: 'Dog Walking', icon: '🚶' },
    { value: 'pet_sitting', label: 'Pet Sitting', icon: '🏡' },
    { value: 'daycare', label: 'Daycare', icon: '🎾' },
    { value: 'overnight_care', label: 'Overnight Care', icon: '🌙' },
    { value: 'grooming', label: 'Grooming', icon: '✨' }
  ];

  const dogSizes: { value: DogSize | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All Sizes', icon: '🐕' },
    { value: 'small', label: 'Small', icon: '🐕‍🦺' },
    { value: 'medium', label: 'Medium', icon: '🐕' },
    { value: 'large', label: 'Large', icon: '🐕‍🦮' },
    { value: 'extra_large', label: 'Extra Large', icon: '🦮' }
  ];

  const clearFilters = () => {
    setFilters({
      serviceType: 'all',
      dogSize: 'all',
      maxPrice: 100,
      hasYard: false,
      hasInsurance: false,
      minExperience: 0
    });
  };

  const activeFiltersCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'serviceType' && value !== 'all') return count + 1;
    if (key === 'dogSize' && value !== 'all') return count + 1;
    if (key === 'maxPrice' && value < 100) return count + 1;
    if ((key === 'hasYard' || key === 'hasInsurance') && value === true) return count + 1;
    if (key === 'minExperience' && value > 0) return count + 1;
    return count;
  }, 0);

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>🎯</span>
            <span>Search Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </CardHeader>

      {showFilters && (
        <CardContent className="space-y-6">
          {/* Service Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Service Type</label>
            <Select
              value={filters.serviceType}
              onValueChange={(value: ServiceType | 'all') =>
                setFilters((prev: FilterState) => ({ ...prev, serviceType: value }))
              }
            >
              <SelectTrigger className="bg-white/50">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((service) => (
                  <SelectItem key={service.value} value={service.value}>
                    <div className="flex items-center space-x-2">
                      <span>{service.icon}</span>
                      <span>{service.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dog Size */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Dog Size</label>
            <Select
              value={filters.dogSize}
              onValueChange={(value: DogSize | 'all') =>
                setFilters((prev: FilterState) => ({ ...prev, dogSize: value }))
              }
            >
              <SelectTrigger className="bg-white/50">
                <SelectValue placeholder="Select dog size" />
              </SelectTrigger>
              <SelectContent>
                {dogSizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    <div className="flex items-center space-x-2">
                      <span>{size.icon}</span>
                      <span>{size.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Max Price per Hour</label>
              <Badge variant="outline">${filters.maxPrice}</Badge>
            </div>
            <Slider
              value={[filters.maxPrice]}
              onValueChange={([value]: number[]) =>
                setFilters((prev: FilterState) => ({ ...prev, maxPrice: value }))
              }
              max={100}
              min={10}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>$10</span>
              <span>$100</span>
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Minimum Experience</label>
              <Badge variant="outline">{filters.minExperience} years</Badge>
            </div>
            <Slider
              value={[filters.minExperience]}
              onValueChange={([value]: number[]) =>
                setFilters((prev: FilterState) => ({ ...prev, minExperience: value }))
              }
              max={10}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0 years</span>
              <span>10+ years</span>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Additional Requirements</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has-yard"
                  checked={filters.hasYard}
                  onCheckedChange={(checked: boolean) =>
                    setFilters((prev: FilterState) => ({ ...prev, hasYard: checked }))
                  }
                />
                <label htmlFor="has-yard" className="text-sm cursor-pointer">
                  🏡 Has a yard
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has-insurance"
                  checked={filters.hasInsurance}
                  onCheckedChange={(checked: boolean) =>
                    setFilters((prev: FilterState) => ({ ...prev, hasInsurance: checked }))
                  }
                />
                <label htmlFor="has-insurance" className="text-sm cursor-pointer">
                  🛡️ Has pet insurance
                </label>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full"
            >
              Clear All Filters
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}