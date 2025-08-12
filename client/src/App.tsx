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
    title: '🐕 Professional Dog Walker & Pet Sitter',
    description: 'Experienced dog walker with 5+ years of caring for dogs of all sizes. I provide daily walks, feeding, and lots of love!',
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
    title: '🏡 Home-Based Dog Daycare with Yard',
    description: 'Your furry friends will love our spacious backyard! We offer daycare, overnight stays, and personalized attention.',
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
    title: '✨ Luxury Pet Care & Grooming',
    description: 'Premium pet care services including grooming, walks, and overnight care. Your pets deserve the best!',
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

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'discover': return '🔍';
      case 'my-dogs': return '🐕';
      case 'bookings': return '📅';
      case 'messages': return '💬';
      case 'profile': return '👤';
      case 'my-listings': return '📝';
      default: return '';
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🐕</div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PawPal
                </h1>
                <p className="text-sm text-gray-500">Your trusted dog sitting platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-700">
                  {getWelcomeMessage()}, {currentUser.first_name}! 👋
                </p>
                <p className="text-xs text-gray-500">{currentUser.location}</p>
              </div>
              <Avatar className="h-10 w-10 border-2 border-blue-200">
                <AvatarImage src={currentUser.profile_image_url || undefined} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {currentUser.first_name[0]}{currentUser.last_name[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="discover" className="space-x-2">
              <span>{getTabIcon('discover')}</span>
              <span className="hidden sm:inline">Discover</span>
            </TabsTrigger>
            <TabsTrigger value="my-dogs" className="space-x-2">
              <span>{getTabIcon('my-dogs')}</span>
              <span className="hidden sm:inline">My Dogs</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="space-x-2">
              <span>{getTabIcon('bookings')}</span>
              <span className="hidden sm:inline">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="space-x-2">
              <span>{getTabIcon('messages')}</span>
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="my-listings" className="space-x-2">
              <span>{getTabIcon('my-listings')}</span>
              <span className="hidden sm:inline">Listings</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="space-x-2">
              <span>{getTabIcon('profile')}</span>
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🔍</span>
                  <span>Find the Perfect Pet Sitter</span>
                </CardTitle>
                <CardDescription>
                  Discover trusted dog sitters in your area. Search by location, services, and more.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter your location (e.g., Manhattan, NY)"
                    value={searchLocation}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchLocation(e.target.value)}
                    className="flex-1 bg-white/50"
                  />
                  <Button onClick={handleSearch} className="px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
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
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">🐕</div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No sitters found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria or location.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* My Dogs Tab */}
          <TabsContent value="my-dogs" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🐕</span>
                  <span>My Dogs</span>
                </CardTitle>
                <CardDescription>
                  Manage your dogs' profiles and information.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dogs.map((dog: Dog) => (
                <DogProfile key={dog.id} dog={dog} />
              ))}
              <Card className="bg-white/50 backdrop-blur-sm border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="text-4xl mb-4">➕</div>
                  <h3 className="font-semibold text-gray-700 mb-2">Add a New Dog</h3>
                  <p className="text-sm text-gray-500">Create a profile for your furry friend</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📅</span>
                  <span>My Bookings</span>
                </CardTitle>
                <CardDescription>
                  View and manage your pet sitting appointments.
                </CardDescription>
              </CardHeader>
            </Card>

            {bookings.length === 0 ? (
              <Card className="bg-white/50 backdrop-blur-sm border-0">
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No bookings yet</h3>
                  <p className="text-gray-500 mb-4">Start by finding a pet sitter in the Discover tab.</p>
                  <Button 
                    onClick={() => setActiveTab('discover')}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    Find a Sitter
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking: Booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>💬</span>
                  <span>Messages</span>
                </CardTitle>
                <CardDescription>
                  Communicate with pet sitters and owners.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No messages yet</h3>
                <p className="text-gray-500">Messages with sitters will appear here after booking.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Listings Tab (for sitters) */}
          <TabsContent value="my-listings" className="space-y-6">
            {currentUser.role === 'sitter' || currentUser.role === 'both' ? (
              <CreateSitterListing userId={currentUser.id} />
            ) : (
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Become a Pet Sitter</h3>
                  <p className="text-gray-500 mb-4">Switch to sitter mode to create service listings.</p>
                  <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                    Become a Sitter
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <UserProfile user={currentUser} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;