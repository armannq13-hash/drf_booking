from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Hotel, RoomType, Facilities, RoomCategory
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Count
from collections import defaultdict
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from .serializers import HotelHomeSerializer, FilteredRoomsSerializer, HotelDashboardSerializer, RoomsDashboardSerializer
from django.db.models import Count, Q, F
from django_countries import countries
from django.shortcuts import get_object_or_404

# Create your views here.


class HotelHomeAPIViewClass(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        hotels = Hotel.objects.annotate(
            room_count = Count(
                'roomtype'
            )
        ).filter(room_count__gt=0)
        
        serializer = HotelHomeSerializer(hotels, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
@api_view(['GET'])
@permission_classes([AllowAny])
def filter_group(request):
    hotels = Hotel.objects.annotate(
        room_count = Count(
            'roomtype'
        )
    ).filter(room_count__gt=0).distinct()
    
    rooms = RoomCategory.objects.filter(roomtype__isnull=False).distinct()
    
    facilities = Facilities.objects.all()
    
    filters_group = defaultdict(list)
    
    for hotel in hotels:
        filters_group['Hotel'].append(hotel.hotel_name)
    
    for room in rooms:
        filters_group['Room Type'].append(room.name)
        
    for facility in facilities:
        filters_group['Facilities'].append(facility.name)
        
    return Response(filters_group, status=status.HTTP_200_OK)



class FilteredRoomsAPIViewClass(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        country = request.query_params.get('country')
        check_in = request.query_params.get('checkIn')
        check_out = request.query_params.get('checkOut')
        max_guests_amount = request.query_params.get('max_guests_amount')
        
        
        hotel_checkboxes = request.query_params.getlist('Hotel')
        roomCategory_checkboxes = request.query_params.getlist('Room Type')
        facility_checkboxes = request.query_params.getlist('Facilities')
        
        rooms = RoomType.objects.prefetch_related('booking_set', 'room_categories', 'room_facilities').select_related('hotel')
        
        
        if check_in and check_out:
            rooms = rooms.annotate(
                intersections = Count(
                    'booking',
                    filter=Q(
                        booking__check_out__gt=check_in,
                        booking__check_in__lt=check_out
                    ) &
                    Q (
                        booking__status='active'
                    )
                )
            ).filter(
                intersections__lt=F('rooms_quantity')
            )
            
        if country:
            country_code = country
            for code, country_name in countries:
                if country == country_name:
                    country_code = code
                    
                
            rooms = rooms.filter(hotel__country=country_code)
            
        if max_guests_amount:
            rooms = rooms.filter(max_guests_amount__gte=int(max_guests_amount))
            
        if hotel_checkboxes:
            rooms = rooms.filter(hotel__hotel_name__in=hotel_checkboxes)
            
        if roomCategory_checkboxes:
            rooms = rooms.filter(room_categories__name__in=roomCategory_checkboxes)
            
        if facility_checkboxes:
            rooms = rooms.filter(room_facilities__name__in=facility_checkboxes).distinct()
            
        serializer = FilteredRoomsSerializer(rooms, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
@api_view(['GET'])
def give_username(request):
    username = request.user.username
    is_business = request.user.is_business
    if username:
        return Response({
            'username': username,
            'is_business': is_business
        }, status=status.HTTP_200_OK)
    else:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    
@api_view(['GET'])
@permission_classes([AllowAny])
def hotel_dashboard(request, property_type):
    id = request.query_params.get('id')
    if property_type == 'hotel':
        hotel = get_object_or_404(Hotel, hotel_id=id)
    elif property_type == 'room':
        room = get_object_or_404(RoomType, room_id=id)
        hotel = room.hotel
        
    serializer = HotelDashboardSerializer(hotel, context={'request': request})
    return Response(serializer.data)




@api_view(['GET'])
@permission_classes([AllowAny])
def filter_rooms_dashboard(request, hotel_id):
    checkIn = request.query_params.get('checkIn')
    checkOut = request.query_params.get('checkOut')
    guests_amount = request.query_params.get('guestsAmount')
    
    if not checkIn or not checkOut:
        rooms = RoomType.objects.filter(
            Q(
                hotel__hotel_id=hotel_id
            )
        )
        
        if guests_amount:
            rooms = rooms.filter(max_guests_amount__gte=int(guests_amount))
            
        serialiser = RoomsDashboardSerializer(rooms, many=True)
        return Response(serialiser.data, status=status.HTTP_200_OK)
    
    
    rooms = RoomType.objects.annotate(
        intersections = Count(
            'booking',
            filter = Q(
                booking__check_in__lt=checkOut,
                booking__check_out__gt=checkIn
            ) & 
            Q(booking__status='active')
        )
    ).filter(
        Q(intersections__lt=F('rooms_quantity')),
        Q(max_guests_amount__gte=int(guests_amount)),
        Q(hotel__hotel_id=hotel_id)
    )
    
    serialiser = RoomsDashboardSerializer(rooms, many=True)
    return Response(serialiser.data, status=status.HTTP_200_OK)
    
    
    
