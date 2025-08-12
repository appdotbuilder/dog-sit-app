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
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'accepted': return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-slate-50 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
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
    <Card className="border border-slate-200 shadow-sm bg-white">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center space-x-2">
              <span className="text-lg">{getServiceIcon(booking.service_type)}</span>
              <span>{formatServiceName(booking.service_type)}</span>
            </CardTitle>
            <p className="text-sm text-slate-500">Booking #{booking.id}</p>
          </div>
          <Badge className={`${getStatusColor(booking.status)} text-xs font-medium`}>
            <span className="mr-1.5">{getStatusIcon(booking.status)}</span>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-5">
        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="font-medium text-slate-700">Start Date</p>
            <div className="space-y-0.5">
              <p className="text-slate-900">{formatDate(booking.start_date)}</p>
              <p className="text-xs text-slate-500">{formatTime(booking.start_date)}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-slate-700">End Date</p>
            <div className="space-y-0.5">
              <p className="text-slate-900">{formatDate(booking.end_date)}</p>
              <p className="text-xs text-slate-500">{formatTime(booking.end_date)}</p>
            </div>
          </div>
        </div>

        {/* Duration and Price */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="font-medium text-slate-700">Duration</p>
            <p className="text-slate-900">{getDuration()}</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-slate-700">Total Price</p>
            <p className="text-slate-900 font-semibold text-lg">${booking.total_price}</p>
          </div>
        </div>

        {/* Special Requests */}
        {booking.special_requests && (
          <div className="space-y-2">
            <p className="font-medium text-slate-700 text-sm flex items-center space-x-2">
              <span className="w-4 h-4 text-sm">💬</span>
              <span>Special Requests</span>
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
              <p className="text-slate-700 text-sm leading-relaxed">
                {booking.special_requests}
              </p>
            </div>
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <div className="space-y-2">
            <p className="font-medium text-slate-700 text-sm flex items-center space-x-2">
              <span className="w-4 h-4 text-sm">📝</span>
              <span>Notes</span>
            </p>
            <div className="bg-green-50 border border-green-100 rounded-md p-3">
              <p className="text-slate-700 text-sm leading-relaxed">
                {booking.notes}
              </p>
            </div>
          </div>
        )}

        <Separator className="bg-slate-100" />

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {booking.status === 'pending' && (
            <>
              <Button 
                variant="outline" 
                className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                Modify
              </Button>
            </>
          )}
          {booking.status === 'accepted' && (
            <>
              <Button 
                variant="outline" 
                className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <span className="mr-2">💬</span>
                Message
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <span className="mr-2">📍</span>
                Track
              </Button>
            </>
          )}
          {booking.status === 'completed' && (
            <>
              <Button 
                variant="outline" 
                className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <span className="mr-2">⭐</span>
                Review
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <span className="mr-2">🔄</span>
                Rebook
              </Button>
            </>
          )}
        </div>

        {/* Created Date */}
        <p className="text-xs text-slate-400 text-center pt-2">
          Booked on: {booking.created_at.toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}