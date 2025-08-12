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
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📝</span>
            <span>Create Sitter Listing</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
                <span>📋</span>
                <span>Basic Information</span>
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Listing Title</label>
                <Input
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateSitterListingInput) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g., Experienced Dog Walker & Pet Lover"
                  className="bg-white/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData((prev: CreateSitterListingInput) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe your experience, what makes you special, and how you'll care for pets..."
                  rows={4}
                  className="bg-white/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateSitterListingInput) => ({ ...prev, location: e.target.value }))
                  }
                  placeholder="e.g., Brooklyn, NY"
                  className="bg-white/50"
                  required
                />
              </div>
            </div>

            <Separator />

            {/* Services Offered */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
                <span>🛠️</span>
                <span>Services Offered</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {serviceTypes.map((service) => (
                  <div key={service.value} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 bg-white/30">
                    <Checkbox
                      id={service.value}
                      checked={formData.services_offered.includes(service.value)}
                      onCheckedChange={(checked: boolean) => handleServiceChange(service.value, checked)}
                    />
                    <div className="flex-1">
                      <label htmlFor={service.value} className="text-sm font-medium cursor-pointer flex items-center space-x-2">
                        <span>{service.icon}</span>
                        <span>{service.label}</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Dog Sizes */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
                <span>🐕</span>
                <span>Dog Sizes Accepted</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {dogSizes.map((size) => (
                  <div key={size.value} className="flex items-start space-x-2 p-3 rounded-lg border border-gray-200 bg-white/30">
                    <Checkbox
                      id={size.value}
                      checked={formData.accepts_sizes.includes(size.value)}
                      onCheckedChange={(checked: boolean) => handleSizeChange(size.value, checked)}
                    />
                    <div className="flex-1">
                      <label htmlFor={size.value} className="text-sm font-medium cursor-pointer flex items-center space-x-2">
                        <span>{size.icon}</span>
                        <span>{size.label}</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">{size.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
                <span>💰</span>
                <span>Pricing</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Price per Hour</label>
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
                    className="bg-white/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Price per Day (optional)</label>
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
                    className="bg-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Price per Night (optional)</label>
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
                    className="bg-white/50"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Capacity & Experience */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
                <span>📊</span>
                <span>Capacity & Experience</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Maximum Dogs</label>
                    <Badge variant="outline">{formData.max_dogs} dogs</Badge>
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
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1 dog</span>
                    <span>10 dogs</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Years of Experience</label>
                    <Badge variant="outline">{formData.experience_years} years</Badge>
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
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0 years</span>
                    <span>20+ years</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Service Radius</label>
                  <Badge variant="outline">{formData.radius_km} km</Badge>
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
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 km</span>
                  <span>50 km</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
                <span>ℹ️</span>
                <span>Additional Information</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-yard"
                    checked={formData.has_yard}
                    onCheckedChange={(checked: boolean) =>
                      setFormData((prev: CreateSitterListingInput) => ({ ...prev, has_yard: checked }))
                    }
                  />
                  <label htmlFor="has-yard" className="text-sm cursor-pointer">
                    🏡 I have a secure yard for dogs to play
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-insurance"
                    checked={formData.has_insurance}
                    onCheckedChange={(checked: boolean) =>
                      setFormData((prev: CreateSitterListingInput) => ({ ...prev, has_insurance: checked }))
                    }
                  />
                  <label htmlFor="has-insurance" className="text-sm cursor-pointer">
                    🛡️ I have pet care insurance
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Emergency Contact (optional)</label>
                <Input
                  value={formData.emergency_contact || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateSitterListingInput) => ({ 
                      ...prev, 
                      emergency_contact: e.target.value || null 
                    }))
                  }
                  placeholder="Emergency contact number"
                  className="bg-white/50"
                />
              </div>
            </div>

            <Separator />

            <Button
              type="submit"
              disabled={isCreating || formData.services_offered.length === 0 || formData.accepts_sizes.length === 0}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              {isCreating ? 'Creating Listing...' : '🚀 Create Sitter Listing'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}