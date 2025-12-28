from django.contrib import admin
from .models import Project, Event, Attendance, Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'assigned_to', 'status', 'points', 'due_date')
    list_filter = ('status', 'due_date')
    search_fields = ('title', 'description', 'assigned_to__username')
    autocomplete_fields = ['assigned_to']


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('user', 'event', 'status', 'marked_by', 'marked_at')
    list_filter = ('status', 'event', 'marked_at')
    search_fields = ('user__username', 'event__title')
    autocomplete_fields = ['user', 'event', 'marked_by']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'status', 'lead', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['name', 'description', 'github_repo']
    autocomplete_fields = ['lead', 'contributors']
    
    filter_horizontal = ['contributors']


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'event_type', 'event_date', 'location', 'created_at']
    list_filter = ['event_type', 'event_date']
    search_fields = ['title', 'description']
