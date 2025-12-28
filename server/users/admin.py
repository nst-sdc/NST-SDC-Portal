from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin configuration."""
    
    # Fields to display in the list view
    list_display = [
        'username',
        'email',
        'student_id',
        'batch_year',
        'points',
        'skill_level',
        'is_member',
        'is_club_admin',
    ]
    
    list_filter = [
        'is_member',
        'is_club_admin',
        'skill_level',
        'batch_year',
        'provider',
    ]
    
    search_fields = [
        'username',
        'email',
        'first_name',
        'last_name',
        'student_id',
        'github_username',
    ]
    
    # Fieldsets for the detail view
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Academic & Identity', {
             'fields': ('student_id', 'batch_year'),
        }),
        ('Club Profile', {
            'fields': (
                'bio', 
                'avatar', 
                'points',
                'skill_level',
                'tech_skills',
                'github_username',
                'portfolio_url',
                'linkedin_url', 
            ),
        }),
        ('Membership', {
            'fields': ('is_member', 'is_club_admin'),
        }),
        ('OAuth', {
            'fields': ('provider', 'provider_id', 'github_id'),
        }),
    )
    
    # Fields for add user form
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('email', 'first_name', 'last_name', 'student_id'),
        }),
    )
