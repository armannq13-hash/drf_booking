from django.urls import path
from . import views

urlpatterns = [
    path('api/admin/hotel/', views.HotelAPIViewClass.as_view()),
    path('api/admin/rooms/', views.RoomAPIViewClass.as_view()),
    path('api/admin/reservations/', views.ReservationAPIViewClass.as_view()),
    
    path('api/admin/owner/hotels/', views.owner_hotels),
    path('api/admin/facilities/', views.FacilitiesAPIViewClass.as_view()),
    path('api/admin/room/categories/', views.room_categories),
    
    path('api/admin/hotel/<str:hotel_id>/', views.HotelChangeAPIViewClass.as_view()),
    path('api/admin/rooms/<str:room_id>/', views.RoomChangeAPIViewClass.as_view()),
]

