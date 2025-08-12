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
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Search Filters
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Badge 
                variant="secondary" 
                className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-medium"
              >
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </CardHeader>

      {showFilters && (
        <CardContent className="pt-6 space-y-6">
          {/* Service Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Service Type</label>
            <Select
              value={filters.serviceType}
              onValueChange={(value: ServiceType | 'all') =>
                setFilters((prev: FilterState) => ({ ...prev, serviceType: value }))
              }
            >
              <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((service) => (
                  <SelectItem key={service.value} value={service.value}>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{service.icon}</span>
                      <span>{service.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dog Size */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Dog Size</label>
            <Select
              value={filters.dogSize}
              onValueChange={(value: DogSize | 'all') =>
                setFilters((prev: FilterState) => ({ ...prev, dogSize: value }))
              }
            >
              <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                <SelectValue placeholder="Select dog size" />
              </SelectTrigger>
              <SelectContent>
                {dogSizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{size.icon}</span>
                      <span>{size.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Max Price per Hour</label>
              <Badge 
                variant="outline" 
                className="border-slate-200 text-slate-600 bg-slate-50 text-xs"
              >
                ${filters.maxPrice}
              </Badge>
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
            <div className="flex justify-between text-xs text-slate-500">
              <span>$10</span>
              <span>$100</span>
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Minimum Experience</label>
              <Badge 
                variant="outline" 
                className="border-slate-200 text-slate-600 bg-slate-50 text-xs"
              >
                {filters.minExperience} years
              </Badge>
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
            <div className="flex justify-between text-xs text-slate-500">
              <span>0 years</span>
              <span>10+ years</span>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-slate-700">Additional Requirements</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="has-yard"
                  checked={filters.hasYard}
                  onCheckedChange={(checked: boolean) =>
                    setFilters((prev: FilterState) => ({ ...prev, hasYard: checked }))
                  }
                  className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label htmlFor="has-yard" className="text-sm text-slate-700 cursor-pointer flex items-center space-x-2">
                  <span>🏡</span>
                  <span>Has a yard</span>
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="has-insurance"
                  checked={filters.hasInsurance}
                  onCheckedChange={(checked: boolean) =>
                    setFilters((prev: FilterState) => ({ ...prev, hasInsurance: checked }))
                  }
                  className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label htmlFor="has-insurance" className="text-sm text-slate-700 cursor-pointer flex items-center space-x-2">
                  <span>🛡️</span>
                  <span>Has pet insurance</span>
                </label>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}