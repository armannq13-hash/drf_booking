from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Hotel, RoomType, Facilities, RoomCategory
from rest_framework.permissions import AllowAny
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
            rooms = rooms.filter(
                room_facilities__name__in=facility_checkboxes
            ).annotate(
                matched = Count(
                    'room_facilities__name',
                    distinct=True
                )
            ).filter(matched=len(facility_checkboxes))
            
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
    
    

# ========AI BOT==============
import os
from dotenv import load_dotenv
from google import genai
import json


load_dotenv()


@api_view(['POST'])
@permission_classes([AllowAny])
def ai_chat_bot(request):
    user_input = request.data.get('user_input')
    
    if not user_input:
        return Response({
            'error': 'user_input is required'
        }, status=400)
    
    # ============================
    gemini_key = os.getenv('GEMINI_API_KEY')
    gemini_model = os.getenv('GEMINI_MODEL')
    # ============================
    facilities_set = [facility.name for facility in Facilities.objects.all()]
    categories_set =[category.name for category in RoomCategory.objects.all()]
    
    
    filter_prompt = f"""
        Analyze the user's text and extract the information into JSON format with the following fields:
        - country (only official country code (or codes as list separated by commas if more than one country was given) that is used in django_countries, if not present return null)
        - hotel_name (or hotel names as list separated by commas if more than one hotel name was given if present, otherwise null)
        - city (or cities as a list separated by commas if more than one city was given if present, otherwise null)
        - max_guests_num ((take the last mentioned max guests number) number of max guests in a room if present, otherwise null)
        - facilities (list of facilities separated by commas if present, otherwise null) --> my facilities(if user misspelled or wrote differently but the meaning is the same): "{facilities_set}"
        - room_type (type of room (or list of room types) if present, otherwise null) --> my categories(if user misspelled or wrote differently but the meaning is the same): "{categories_set}"
        
        Return only a valid JSON object, without any extra text or conversational fillers!
        
        User text:
        "{user_input}"
    """
    
    
    client = genai.Client(api_key=gemini_key)
    response = client.models.generate_content(
        model=gemini_model,
        contents=filter_prompt
    )
    
    if not response or not response.text:
        return Response({
            'error': 'No response'
        }, status=500)
    
    try:
        raw_text = response.text.strip()
        
        if raw_text.startswith('```json'):
            raw_text = raw_text[7:]
        if raw_text.endswith('```'):
            raw_text = raw_text[:-3]
            
        data = json.loads(raw_text.strip())
        
    except json.JSONDecodeError:
        return Response({
            'error': 'Failed to parse AI response'
        }, status=500)
        
        
    country = data.get('country')
    hotel_name = data.get('hotel_name')
    city = data.get('city')
    max_guests_num = data.get('max_guests_num')
    facilities = data.get('facilities')
    room_type = data.get('room_type')
    
    filtered_rooms = RoomType.objects.select_related('hotel').prefetch_related('room_facilities', 'room_categories')
    
    def if_is_instance(parameter):
        if parameter is None:
            return []
        
        if isinstance(parameter, str):
            return [parameter]
        
        return parameter
    
    if country:
        country = if_is_instance(country)
        filtered_rooms = filtered_rooms.filter(hotel__country__in=country)
    
    if hotel_name:
        hotel_name = if_is_instance(hotel_name)
        filtered_rooms = filtered_rooms.filter(hotel__hotel_name__in=hotel_name)
        
    if city:
        city = if_is_instance(city)
        filtered_rooms = filtered_rooms.filter(hotel__city__in=city)
        
    if max_guests_num is not None:
        filtered_rooms = filtered_rooms.filter(max_guests_amount__gte=max_guests_num)
        
    if facilities:
        facilities = if_is_instance(facilities)
        filtered_rooms = filtered_rooms.filter(room_facilities__name__in=facilities)
        
    if room_type:
        room_type = if_is_instance(room_type)
        filtered_rooms = filtered_rooms.filter(room_categories__name__in=room_type)
        
    filtered_rooms = filtered_rooms.distinct()
    
    rooms_data = []
    for room in filtered_rooms:
        rooms_data.append({
            'room_title': room.room_title,
            'hotel_name': room.hotel.hotel_name,
            'room_description': room.room_description,
            'hotel_description': room.hotel.hotel_description,
            'country': room.hotel.country.name,
            'city': room.hotel.city,
            'price': room.price_one_night,
            'max_guests_amount': room.max_guests_amount,
            'facilities': [facility.name for facility in room.room_facilities.all()]
        })
        
        
    if not rooms_data:
        return Response({
            'ai_response': 'Unfortunately no rooms/hotels were found for your request'
        }, status=status.HTTP_200_OK)
        
        
    response_prompt = f"""
        You are an elite, highly experienced travel concierge and tour agent with deep knowledge of global destinations, local cultures, and premium hospitality/
        Your task is to analyse the user's request and the list of available rooms provided below, select the absolute best match(-es), and provide a compelling, personalized reccommendation.
        
        ##INSTRUCTIONS:
        1. Analyze the Request and Options: Look closely at what the user wants (destination, budget/guests, preferences, facilities) and match it with the available rooms for the database.
        2. Select the best Option(s): Choose the top 1 or 2 rooms OR hotel (based on what the user wants) that fit best. If multiple options are great, briefly contrast them.
        3. Justify the Choice: Explain why this specific hotel/room are 10/10 match for this particular user.Highlight its key strengths (location, capacity, vibe, amenties).
        4. Act like a Professional Travel Agent: Write. in an engaging, warm, professional, and inspiring tone.
        5. Provide Local Insider Tips (Crusial): Based on the city/country of the chosen room/hotel provide rich, practical recommendations:
        --  Where to go and What to do: Top sights, hidden gems, or activitiestailored to the destination.
        --  What to buy: Authentic local souvenirs, products, or markets worth visiting.
        --  Approximate local prices / Budget guide: Give realistic price estimates for meals, transport, or popular local experiences(in local currency or USD or if the user requested the specific currency).
        -- Pro-tips: Useful local customs, words/sentences, transport advice, rules that you must be aware of if any, or best times to visit spots to avoid crowds.
        
        
        ##DATA INPUT:
        -- User Request: "{user_input}"
        -- Available Rooms (JSON format from database): {json.dumps(rooms_data, ensure_ascii=False, indent=2)}
        
        ##RESPONSE FORMAT (in the language of the user's request, perfectly structured):
        -- Top Recommendations (name of the hotel and room)
        -- Why this Choice
        -- Local Guide and Insider Tips:
           -- Where to go and what to see.
           -- What to buy
           -- Approximate realistic prices
           -- Usefull lifehacks etc
           
        !IMPORTANT: the response must not contain extra symbols like #, * etc.You can use emojis if needed
        
    """
    
    response2 = client.models.generate_content(
        model=gemini_model,
        contents=response_prompt
    )
    
    if not response2 or not response2.text:
        return Response({
            'error': 'No response'
        }, status=500)
        
    return Response({
        'ai_response': response2.text
    }, status=status.HTTP_200_OK)

