

# Create your views here.
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import BookingSerializerClass
from .models import Booking
from django.shortcuts import get_object_or_404


class BookingAPIViewClass(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = BookingSerializerClass(data=request.data)
        
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(
                {"message": "Success!"},
                status=status.HTTP_201_CREATED,
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
    
    

def add_dict(booking):
    amount_nights = (booking.check_out - booking.check_in).days 
    hotel_image = booking.room.hotel.hotelimages_set.first()

    return {
        "room_title": booking.room.room_title,
        "hotel_name": booking.room.hotel.hotel_name,
        "hotel_img": hotel_image.image.url if hotel_image else "",
        "country": booking.room.hotel.country.name,
        "city": booking.room.hotel.city,
        "check_in": booking.check_in,
        "check_out": booking.check_out,
        "price": int(amount_nights) * int(booking.room.price_one_night),
        "status": booking.status,
        "amount_nights": amount_nights,
        "booking_id": booking.id,
    }


class UserProfileAPIViewClass(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        
        
        active_reserves = Booking.objects.filter(
            user=request.user,
            status='active'
        ).select_related('room', 'room__hotel')
        
        cancelled_reserves = Booking.objects.filter(
            user=request.user,
            status='cancelled'
        ).select_related('room', 'room__hotel')
        
        active_bookings = []
        cancelled_bookings = []
        
        for active_booking in active_reserves:
            active_bookings.append(add_dict(active_booking))
            
        for cancelled_booking in cancelled_reserves:
            cancelled_bookings.append(add_dict(cancelled_booking))

        
        return Response({
            'active_bookings': active_bookings,
            'cancelled_bookings': cancelled_bookings
        }, status=status.HTTP_200_OK)
        
        
    def patch(self, request):
        try:
            booking_id = request.data.get('booking_id')
            
            booking = get_object_or_404(Booking, id=booking_id, user=request.user)
            if booking.status == 'cancelled':
                return Response({
                    'message': 'Reservation was already cancelled'
                }, status=status.HTTP_400_BAD_REQUEST)
                
                
            booking.status = 'cancelled'
            booking.save()
            
            return Response({
                'message': 'Successfully cancelled'
            })
            
        except:
            return Response({
                'message': 'Something went wrong'
            })
        