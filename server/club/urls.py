from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DashboardViewSet

router = DefaultRouter()
# Since DashboardViewSet is a ViewSet but we are using it as a singleton-like endpoint, 
# we can bind it manually or use a router with a specific basename if we bad standard ViewSets.
# But for 'dashboard' logical grouping, let's just make it a simple path.

urlpatterns = [
    path('dashboard/', DashboardViewSet.as_view({'get': 'list'}), name='api-dashboard'),
]
