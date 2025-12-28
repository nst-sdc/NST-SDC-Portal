from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'student_id', 'batch_year', 'points',
            'is_member', 'is_club_admin', 'is_staff',
            'avatar', 'bio',
            'github_username', 'linkedin_url', 'portfolio_url', 'tech_skills',
            'skill_level',
        ]
