from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from .models import Task, Event, Project
from .serializers import TaskSerializer, EventSerializer, ProjectSerializer

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        user = request.user
        
        # Active Tasks
        active_tasks = Task.objects.filter(assigned_to=user, status='in_progress')
        task_serializer = TaskSerializer(active_tasks, many=True)
        
        # Upcoming Events
        upcoming_events = Event.objects.filter(event_date__gte=timezone.now()).order_by('event_date')[:5]
        event_serializer = EventSerializer(upcoming_events, many=True)
        
        return Response({
            'user': {
                'name': user.get_full_name(),
                'points': user.points,
                'batch': user.batch_year,
                'student_id': user.student_id
            },
            'active_tasks': task_serializer.data,
            'upcoming_events': event_serializer.data
        })
