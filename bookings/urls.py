from django.urls import path
from . import views

urlpatterns = [
    path('', views.BookingAPIViewClass.as_view()),
    path('api/user_profile/', views.UserProfileAPIViewClass.as_view()),
]