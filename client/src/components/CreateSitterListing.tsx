import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import type { CreateSitterListingInput, ServiceType, DogSize } from '../../../server/src/schema';

interface CreateSitterListingProps {
  userId: number;
}

export function CreateSitterListing({ userId }: CreateSitterListingProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateSitterListingInput>({
    sitter_id: userId,
    title: '',
    description: '',
    services_offered: [],
    price_per_hour: 25,
    price_per_day: null,
    price_per_night: null,
    max_dogs: 2,
    accepts_sizes: [],
    location: '',
    radius_km: 10,
    experience_years: 1,
    has_yard: false,
    has_insurance: false,
    emergency_contact: null
  });

  const serviceTypes: { value: ServiceType; label: string; icon: string; description: string }[] = [
    { 
      value: 'dog_walking', 
      label: 'Dog Walking', 
      icon: '🚶',
      description: 'Take dogs for walks in the neighborhood'
    },
    { 
      value: 'pet_sitting', 
      label: 'Pet Sitting', 
      icon: '🏡',
      description: 'Care for pets in their own home'
    },
    { 
      value: 'daycare', 
      label: 'Daycare', 
      icon: '🎾',
      description: 'Daytime care and supervision'
    },
    { 
      value: 'overnight_care', 
      label: 'Overnight Care', 
      icon: '🌙',
      description: 'Stay overnight with pets'
    },
    { 
      value: 'grooming', 
      label: 'Grooming', 
      icon: '✨',
      description: 'Bathing, brushing, and grooming services'
    }
  ];

  const dogSizes: { value: DogSize; label: string; icon: string; description: string }[] = [
    { value: 'small', label: 'Small', icon: '🐕‍🦺', description: 'Up to 25 lbs' },
    { value: 'medium', label: 'Medium', icon: '🐕', description: '26-60 lbs' },
    { value: 'large', label: 'Large', icon: '🐕‍🦮', description: '61-100 lbs' },
    { value: 'extra_large', label: 'Extra Large', icon: '🦮', description: '100+ lbs' }
  ];

  const handleServiceChange = (service: ServiceType, checked: boolean) => {
    setFormData((prev: CreateSitterListingInput) => ({
      ...prev,
      services_offered: checked
        ? [...prev.services_offered, service]
        : prev.services_offered.filter(s => s !== service)
    }));
  };

  const handleSizeChange = (size: DogSize, checked: boolean) => {
    setFormData((prev: CreateSitterListingInput) => ({
      ...prev,
      accepts_sizes: checked
        ? [...prev.accepts_sizes, size]
        : prev.accepts_sizes.filter(s => s !== size)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      // STUB: This would normally call the real API
      // await trpc.createSitterListing.mutate(formData);
      console.log('Sitter listing created:', formData);
      
      // Reset form
      setFormData({
        sitter_id: userId,
        title: '',
        description: '',
        services_offered: [],
        price_per_hour: 25,
        price_per_day: null,
        price_per_night: null,
        max_dogs: 2,
        accepts_sizes: [],
        location: '',
        radius_km: 10,
        experience_years: 1,
        has_yard: false,
        has_insurance: false,
        emergency_contact: null
      });
    } catch (error) {
      console.error('Failed to create listing:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
            <span className="w-5 h-5 text-lg">📝</span>
            <span>Create Sitter Listing</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-5">
              <h3 className="font-semibold text-slate-800 flex items-center space-x-2 text-base">
                <span className="w-5 h-5 text-base">📋</span>
                <span>Basic Information</span>
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Listing Title</label>
                <Input
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateSitterListingInput) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g., Experienced Dog Walker & Pet Care Professional"
                  className="border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData((prev: CreateSitterListingInput) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe your experience, qualifications, and approach to pet care..."
                  rows={4}
                  className="border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateSitterListingInput) => ({ ...prev, location: e.target.value }))
                  }
                  placeholder="e.g., Brooklyn, NY"
                  className="border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            <Separator className="bg-slate-100" />

            {/* Services Offered */}
            <div className="space-y-5">
              <h3 className="font-semibold text-slate-800 flex items-center space-x-2 text-base">
                <span className="w-5 h-5 text-base">🛠️</span>
                <span>Services Offered</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceTypes.map((service) => (
                  <div key={service.value} className="flex items-start space-x-3 p-4 rounded-md border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <Checkbox
                      id={service.value}
                      checked={formData.services_offered.includes(service.value)}
                      onCheckedChange={(checked: boolean) => handleServiceChange(service.value, checked)}
                      className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 mt-0.5"
                    />
                    <div className="flex-1">
                      <label htmlFor={service.value} className="text-sm font-medium cursor-pointer flex items-center space-x-2 text-slate-900">
                        <span className="text-base">{service.icon}</span>
                        <span>{service.label}</span>
                      </label>
                      <p className="text-xs text-slate-600 mt-1">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-slate-100" />

            {/* Dog Sizes */}
            <div className="space-y-5">
              <h3 className="font-semibold text-slate-800 flex items-center space-x-2 text-base">
                <span className="w-5 h-5 text-base">🐕</span>
                <span>Dog Sizes Accepted</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dogSizes.map((size) => (
                  <div key={size.value} className="flex items-start space-x-2 p-4 rounded-md border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <Checkbox
                      id={size.value}
                      checked={formData.accepts_sizes.includes(size.value)}
                      onCheckedChange={(checked: boolean) => handleSizeChange(size.value, checked)}
                      className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 mt-0.5"
                    />
                    <div className="flex-1">
                      <label htmlFor={size.value} className="text-sm font-medium cursor-pointer flex items-center space-x-2 text-slate-900">
                        <span className="text-base">{size.icon}</span>
                        <span>{size.label}</span>
                      </label>
                      <p className="text-xs text-slate-600 mt-1">{size.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-slate-100" />

            {/* Pricing */}
            <div className="space-y-5">
              <h3 className="font-semibold text-slate-800 flex items-center space-x-2 text-base">
                <span className="w-5 h-5 text-base">💰</span>
                <span>Pricing</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Price per Hour</label>
                  <Input
                    type="number"
                    value={formData.price_per_hour}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateSitterListingInput) => ({ 
                        ...prev, 
                        price_per_hour: parseFloat(e.target.value) || 0 
                      }))
                    }
                    min="5"
                    step="0.50"
                    className="border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Price per Day (optional)</label>
                  <Input
                    type="number"
                    value={formData.price_per_day || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateSitterListingInput) => ({ 
                        ...prev, 
                        price_per_day: e.target.value ? parseFloat(e.target.value) : null 
                      }))
                    }
                    min="20"
                    step="5"
                    placeholder="Optional"
                    className="border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Price per Night (optional)</label>
                  <Input
                    type="number"
                    value={formData.price_per_night || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateSitterListingInput) => ({ 
                        ...prev, 
                        price_per_night: e.target.value ? parseFloat(e.target.value) : null 
                      }))
                    }
                    min="30"
                    step="5"
                    placeholder="Optional"
                    className="border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            {/* Capacity & Experience */}
            <div className="space-y-5">
              <h3 className="font-semibold text-slate-800 flex items-center space-x-2 text-base">
                <span className="w-5 h-5 text-base">📊</span>
                <span>Capacity & Experience</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">Maximum Dogs</label>
                    <Badge 
                      variant="outline" 
                      className="border-slate-200 text-slate-600 bg-slate-50 text-xs"
                    >
                      {formData.max_dogs} dogs
                    </Badge>
                  </div>
                  <Slider
                    value={[formData.max_dogs]}
                    onValueChange={([value]: number[]) =>
                      setFormData((prev: CreateSitterListingInput) => ({ ...prev, max_dogs: value }))
                    }
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>1 dog</span>
                    <span>10 dogs</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">Years of Experience</label>
                    <Badge 
                      variant="outline" 
                      className="border-slate-200 text-slate-600 bg-slate-50 text-xs"
                    >
                      {formData.experience_years} years
                    </Badge>
                  </div>
                  <Slider
                    value={[formData.experience_years]}
                    onValueChange={([value]: number[]) =>
                      setFormData((prev: CreateSitterListingInput) => ({ ...prev, experience_years: value }))
                    }
                    max={20}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>0 years</span>
                    <span>20+ years</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Service Radius</label>
                  <Badge 
                    variant="outline" 
                    className="border-slate-200 text-slate-600 bg-slate-50 text-xs"
                  >
                    {formData.radius_km} km
                  </Badge>
                </div>
                <Slider
                  value={[formData.radius_km]}
                  onValueChange={([value]: number[]) =>
                    setFormData((prev: CreateSitterListingInput) => ({ ...prev, radius_km: value }))
                  }
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>1 km</span>
                  <span>50 km</span>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            {/* Additional Information */}
            <div className="space-y-5">
              <h3 className="font-semibold text-slate-800 flex items-center space-x-2 text-base">
                <span className="w-5 h-5 text-base">ℹ️</span>
                <span>Additional Information</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="has-yard"
                    checked={formData.has_yard}
                    onCheckedChange={(checked: boolean) =>
                      setFormData((prev: CreateSitterListingInput) => ({ ...prev, has_yard: checked }))
                    }
                    className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <label htmlFor="has-yard" className="text-sm cursor-pointer text-slate-700 flex items-center space-x-2">
                    <span>🏡</span>
                    <span>I have a secure yard for dogs to play</span>
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="has-insurance"
                    checked={formData.has_insurance}
                    onCheckedChange={(checked: boolean) =>
                      setFormData((prev: CreateSitterListingInput) => ({ ...prev, has_insurance: checked }))
                    }
                    className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <label htmlFor="has-insurance" className="text-sm cursor-pointer text-slate-700 flex items-center space-x-2">
                    <span>🛡️</span>
                    <span>I have pet care insurance</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Emergency Contact (optional)</label>
                <Input
                  value={formData.emergency_contact || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateSitterListingInput) => ({ 
                      ...prev, 
                      emergency_contact: e.target.value || null 
                    }))
                  }
                  placeholder="Emergency contact number"
                  className="border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <Separator className="bg-slate-100" />

            <Button
              type="submit"
              disabled={isCreating || formData.services_offered.length === 0 || formData.accepts_sizes.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3"
            >
              {isCreating ? (
                <>
                  <span className="mr-2">⏳</span>
                  Creating Listing...
                </>
              ) : (
                <>
                  <span className="mr-2">🚀</span>
                  Create Sitter Listing
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}