from django.urls import path
from . import views

urlpatterns = [
    path('home/filters/', views.filter_group),
    path('home/', views.HotelHomeAPIViewClass.as_view()),
    path('home/filter/rooms/', views.FilteredRoomsAPIViewClass.as_view()),
    path('home/give/username/', views.give_username),
    path('home/dashboard/<str:property_type>/', views.hotel_dashboard),
    path('home/dashboard/rooms/<str:hotel_id>/', views.filter_rooms_dashboard),
    path('api/chat-bot/', views.ai_chat_bot),
]