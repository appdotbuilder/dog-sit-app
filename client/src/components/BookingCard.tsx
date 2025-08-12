import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Booking } from '../../../server/src/schema';

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'accepted': return '✅';
      case 'rejected': return '❌';
      case 'completed': return '🎉';
      case 'cancelled': return '🚫';
      default: return '📅';
    }
  };

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

  const formatServiceName = (service: string) => {
    return service.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDuration = () => {
    if (booking.total_hours) {
      return `${booking.total_hours} hours`;
    }
    if (booking.total_days) {
      return `${booking.total_days} days`;
    }
    const diffTime = booking.end_date.getTime() - booking.start_date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center space-x-2">
              <span>{getServiceIcon(booking.service_type)}</span>
              <span>{formatServiceName(booking.service_type)}</span>
            </CardTitle>
            <p className="text-sm text-gray-600">Booking #{booking.id}</p>
          </div>
          <Badge className={getStatusColor(booking.status)}>
            <span className="mr-1">{getStatusIcon(booking.status)}</span>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="font-medium text-gray-700">Start Date</p>
            <div className="space-y-0.5">
              <p className="text-gray-600">{formatDate(booking.start_date)}</p>
              <p className="text-xs text-gray-500">{formatTime(booking.start_date)}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-700">End Date</p>
            <div className="space-y-0.5">
              <p className="text-gray-600">{formatDate(booking.end_date)}</p>
              <p className="text-xs text-gray-500">{formatTime(booking.end_date)}</p>
            </div>
          </div>
        </div>

        {/* Duration and Price */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="font-medium text-gray-700">Duration</p>
            <p className="text-gray-600">{getDuration()}</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-700">Total Price</p>
            <p className="text-gray-600 font-semibold">${booking.total_price}</p>
          </div>
        </div>

        {/* Special Requests */}
        {booking.special_requests && (
          <div className="space-y-2">
            <p className="font-medium text-gray-700 text-sm flex items-center space-x-1">
              <span>💬</span>
              <span>Special Requests</span>
            </p>
            <p className="text-gray-600 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100">
              {booking.special_requests}
            </p>
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <div className="space-y-2">
            <p className="font-medium text-gray-700 text-sm flex items-center space-x-1">
              <span>📝</span>
              <span>Notes</span>
            </p>
            <p className="text-gray-600 text-sm bg-green-50 p-3 rounded-lg border border-green-100">
              {booking.notes}
            </p>
          </div>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {booking.status === 'pending' && (
            <>
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500">
                Modify
              </Button>
            </>
          )}
          {booking.status === 'accepted' && (
            <>
              <Button variant="outline" className="flex-1">
                💬 Message
              </Button>
              <Button variant="outline" className="flex-1">
                📍 Track
              </Button>
            </>
          )}
          {booking.status === 'completed' && (
            <>
              <Button variant="outline" className="flex-1">
                ⭐ Review
              </Button>
              <Button variant="outline" className="flex-1">
                🔄 Rebook
              </Button>
            </>
          )}
        </div>

        {/* Created Date */}
        <p className="text-xs text-gray-400 text-center">
          Booked on: {booking.created_at.toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}