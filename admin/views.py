from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from hotels.models import Hotel, RoomType, Facilities, RoomCategory
from .serializers import HotelSerializer, RoomSerializer, HotelDetailSerializer, FacilitiesSerializer, RoomCategorySerializer, HotelChangeSerializer, RoomChangeSerializer, ReservationsSerializer
from rest_framework.permissions import IsAuthenticated
from bookings.models import Booking

# Create your views here.
# --------------HOTEL-------------------------

class HotelAPIViewClass(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not request.user.is_business:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        hotels = Hotel.objects.filter(owner=request.user)
        serializer = HotelSerializer(hotels, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        if not request.user.is_business:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        serializer = HotelSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class HotelChangeAPIViewClass(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, hotel_id):
        if not request.user.is_business:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        hotel = get_object_or_404(Hotel, hotel_id=hotel_id)
        serializer = HotelChangeSerializer(hotel)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def patch(self, request, hotel_id):
        if not request.user.is_business:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        hotel = get_object_or_404(Hotel, hotel_id = hotel_id)
        serializer = HotelChangeSerializer(instance=hotel, data=request.data, partial=True)
        
        if hotel.owner != request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, hotel_id):
        if not request.user.is_business:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        hotel = get_object_or_404(Hotel, hotel_id=hotel_id)
        
        if hotel.owner != request.user:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        hotel.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        
    
# ------------------ROOM----------------------
    
class RoomAPIViewClass(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not request.user.is_business:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        rooms = RoomType.objects.filter(hotel__owner=request.user).select_related('hotel')
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
        
    def post(self, request):
        if not request.user.is_business:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        serializer = RoomSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class RoomChangeAPIViewClass(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, room_id):
        if not request.user.is_business:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        room = get_object_or_404(RoomType, room_id=room_id)
        serializer = RoomChangeSerializer(room)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    def patch(self, request, room_id):
        if not request.user.is_business:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        room = get_object_or_404(RoomType, room_id=room_id)
        serializer = RoomChangeSerializer(instance=room, data=request.data, partial=True)
        
        if room.hotel.owner != request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, room_id):
        if not request.user.is_business:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        
        room = get_object_or_404(RoomType, room_id = room_id)
        
        if room.hotel.owner != request.user:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        room.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    
# ---------------------
@api_view(['GET'])
def owner_hotels(request):
    hotels = Hotel.objects.filter(owner=request.user)
    serializer = HotelDetailSerializer(hotels, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
    
# ============FACILITIES============
    
class FacilitiesAPIViewClass(APIView):
    def get(self, request):
        facilities = Facilities.objects.all()
        serializer = FacilitiesSerializer(facilities, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = FacilitiesSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        
        return Response(status=status.HTTP_400_BAD_REQUEST)
        
        
@api_view(['GET'])
def room_categories(request):
    room_categories = RoomCategory.objects.all()
    serializer = RoomCategorySerializer(room_categories, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)



# ============RESERVATIONS============

class ReservationAPIViewClass(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not request.user.is_business:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        bookings = Booking.objects.filter(room__hotel__owner=request.user).select_related(
            'room', 
            'room__hotel', 
            'user'
            ).order_by('status')
        serializer = ReservationsSerializer(bookings, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)