import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { trpc } from '@/utils/trpc';
import type { User, SitterListing, Dog, Booking } from '../../server/src/schema';
import { SearchFilters } from '@/components/SearchFilters';
import { SitterCard } from '@/components/SitterCard';
import { DogProfile } from '@/components/DogProfile';
import { BookingCard } from '@/components/BookingCard';
import { UserProfile } from '@/components/UserProfile';
import { CreateSitterListing } from '@/components/CreateSitterListing';
import './App.css';

// STUB: Mock data for demonstration purposes since backend handlers are placeholder
const mockUser: User = {
  id: 1,
  email: 'john@example.com',
  password_hash: 'hashed',
  first_name: 'John',
  last_name: 'Doe',
  phone: '+1234567890',
  profile_image_url: null,
  role: 'owner' as const,
  location: 'New York, NY',
  bio: 'Dog lover and responsible pet owner',
  created_at: new Date(),
  updated_at: new Date()
};

const mockSitters: SitterListing[] = [
  {
    id: 1,
    sitter_id: 2,
    title: 'Professional Dog Walker & Pet Sitter',
    description: 'Experienced dog walker with 5+ years of caring for dogs of all sizes. I provide daily walks, feeding, and comprehensive pet care services.',
    services_offered: ['dog_walking', 'pet_sitting'],
    price_per_hour: 25,
    price_per_day: 150,
    price_per_night: 75,
    max_dogs: 3,
    accepts_sizes: ['small', 'medium', 'large'],
    location: 'Manhattan, NY',
    radius_km: 10,
    experience_years: 5,
    has_yard: false,
    has_insurance: true,
    emergency_contact: '+1234567890',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    sitter_id: 3,
    title: 'Home-Based Dog Daycare with Yard',
    description: 'Your pets will enjoy our spacious backyard facility. We offer daycare, overnight stays, and personalized attention in a safe environment.',
    services_offered: ['daycare', 'overnight_care', 'pet_sitting'],
    price_per_hour: 20,
    price_per_day: 120,
    price_per_night: 60,
    max_dogs: 5,
    accepts_sizes: ['small', 'medium', 'large', 'extra_large'],
    location: 'Brooklyn, NY',
    radius_km: 15,
    experience_years: 8,
    has_yard: true,
    has_insurance: true,
    emergency_contact: '+1987654321',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    sitter_id: 4,
    title: 'Premium Pet Care & Grooming Services',
    description: 'Professional pet care services including grooming, walks, and overnight care. Certified and insured for your peace of mind.',
    services_offered: ['pet_sitting', 'grooming', 'overnight_care'],
    price_per_hour: 35,
    price_per_day: 200,
    price_per_night: 100,
    max_dogs: 2,
    accepts_sizes: ['small', 'medium'],
    location: 'Queens, NY',
    radius_km: 8,
    experience_years: 3,
    has_yard: false,
    has_insurance: true,
    emergency_contact: '+1555123456',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

const mockDogs: Dog[] = [
  {
    id: 1,
    owner_id: 1,
    name: 'Buddy',
    breed: 'Golden Retriever',
    age: 3,
    size: 'large',
    weight: 65,
    temperament: ['friendly', 'playful'],
    medical_notes: 'Up to date on all vaccinations',
    special_instructions: 'Loves belly rubs and needs two walks per day',
    profile_image_url: null,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

function App() {
  const [currentUser] = useState<User>(mockUser);
  const [activeTab, setActiveTab] = useState('discover');
  const [sitters, setSitters] = useState<SitterListing[]>([]);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchLocation, setSearchLocation] = useState('');

  // Load data on component mount
  useEffect(() => {
    // STUB: Using mock data since backend handlers are placeholders
    setSitters(mockSitters);
    setDogs(mockDogs);
    setBookings([]);
  }, []);

  const handleSearch = useCallback(async () => {
    try {
      // STUB: This would normally call the real API
      // const result = await trpc.searchSitters.query({ location: searchLocation });
      // setSitters(result);
      
      // For now, filter mock data by location
      const filteredSitters = mockSitters.filter(sitter => 
        sitter.location.toLowerCase().includes(searchLocation.toLowerCase()) || 
        searchLocation === ''
      );
      setSitters(filteredSitters);
    } catch (error) {
      console.error('Failed to search sitters:', error);
    }
  }, [searchLocation]);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <div className="text-white text-lg font-bold">P</div>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">PawPal</h1>
                <p className="text-sm text-slate-500">Professional Pet Care</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-slate-700">
                  {getWelcomeMessage()}, {currentUser.first_name}
                </p>
                <p className="text-xs text-slate-500">{currentUser.location}</p>
              </div>
              <Avatar className="h-9 w-9 border border-slate-200">
                <AvatarImage src={currentUser.profile_image_url || undefined} />
                <AvatarFallback className="bg-slate-100 text-slate-600 text-sm font-medium">
                  {currentUser.first_name[0]}{currentUser.last_name[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 bg-white border border-slate-200 p-1">
            <TabsTrigger 
              value="discover" 
              className="text-sm font-medium data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
            >
              <span className="mr-2">🔍</span>
              <span className="hidden sm:inline">Discover</span>
            </TabsTrigger>
            <TabsTrigger 
              value="my-dogs"
              className="text-sm font-medium data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
            >
              <span className="mr-2">🐕</span>
              <span className="hidden sm:inline">My Dogs</span>
            </TabsTrigger>
            <TabsTrigger 
              value="bookings"
              className="text-sm font-medium data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
            >
              <span className="mr-2">📅</span>
              <span className="hidden sm:inline">Bookings</span>
            </TabsTrigger>
            <TabsTrigger 
              value="messages"
              className="text-sm font-medium data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
            >
              <span className="mr-2">💬</span>
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger 
              value="my-listings"
              className="text-sm font-medium data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
            >
              <span className="mr-2">📝</span>
              <span className="hidden sm:inline">Listings</span>
            </TabsTrigger>
            <TabsTrigger 
              value="profile"
              className="text-sm font-medium data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
            >
              <span className="mr-2">👤</span>
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-8">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Find Professional Pet Sitters
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Discover trusted and verified pet care professionals in your area.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter location (e.g., Manhattan, NY)"
                    value={searchLocation}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchLocation(e.target.value)}
                    className="flex-1 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <Button 
                    onClick={handleSearch} 
                    className="px-6 bg-blue-600 hover:bg-blue-700 text-white border-0"
                  >
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            <SearchFilters />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sitters.map((sitter: SitterListing) => (
                <SitterCard key={sitter.id} sitter={sitter} />
              ))}
              {sitters.length === 0 && (
                <div className="col-span-full">
                  <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <h3 className="empty-state-title">No sitters found</h3>
                    <p className="empty-state-description">
                      Try adjusting your search criteria or location to find available pet sitters.
                    </p>
                    <Button 
                      onClick={() => setSearchLocation('')}
                      className="btn-secondary"
                    >
                      Clear Search
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* My Dogs Tab */}
          <TabsContent value="my-dogs" className="space-y-8">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-semibold text-slate-900">
                  My Dogs
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Manage your dogs' profiles and information.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dogs.map((dog: Dog) => (
                <DogProfile key={dog.id} dog={dog} />
              ))}
              <Card className="border-2 border-dashed border-slate-300 hover:border-slate-400 transition-colors cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-xl text-slate-400">+</span>
                  </div>
                  <h3 className="font-medium text-slate-700 mb-2">Add a New Dog</h3>
                  <p className="text-sm text-slate-500">Create a profile for your pet</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-8">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-semibold text-slate-900">
                  My Bookings
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  View and manage your pet sitting appointments.
                </CardDescription>
              </CardHeader>
            </Card>

            {bookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <h3 className="empty-state-title">No bookings yet</h3>
                <p className="empty-state-description">
                  Start by finding a pet sitter in the Discover tab to create your first booking.
                </p>
                <Button 
                  onClick={() => setActiveTab('discover')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Find a Sitter
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking: Booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-8">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Messages
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Communicate with pet sitters and owners.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <h3 className="empty-state-title">No messages yet</h3>
              <p className="empty-state-description">
                Messages with sitters will appear here once you start booking services.
              </p>
            </div>
          </TabsContent>

          {/* My Listings Tab (for sitters) */}
          <TabsContent value="my-listings" className="space-y-8">
            {currentUser.role === 'sitter' || currentUser.role === 'both' ? (
              <CreateSitterListing userId={currentUser.id} />
            ) : (
              <Card className="border border-slate-200 shadow-sm">
                <CardContent className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl text-slate-400">📝</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    Become a Pet Sitter
                  </h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    Switch to sitter mode to create service listings and start earning by caring for pets.
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Become a Sitter
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-8">
            <UserProfile user={currentUser} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;