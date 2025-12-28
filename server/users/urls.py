from django.urls import path
from .views import UserProfileView

urlpatterns = [
    path('user/profile/', UserProfileView.as_view(), name='api-user-profile'),
]
