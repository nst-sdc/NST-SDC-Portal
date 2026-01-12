from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DashboardViewSet, ProjectViewSet, EventViewSet,
    AttendanceViewSet, TaskViewSet
)

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'events', EventViewSet, basename='event')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns = [
    path('dashboard/', DashboardViewSet.as_view({'get': 'list'}), name='api-dashboard'),
    path('', include(router.urls)),
]
