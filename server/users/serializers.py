from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Full user serializer with all fields"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'student_id', 'batch_year', 'points',
            'is_member', 'is_club_admin', 'is_staff',
            'avatar', 'bio',
            'github_username', 'linkedin_url', 'portfolio_url',
            'tech_skills', 'skill_level',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'points', 'created_at', 'updated_at', 'is_staff']
        extra_kwargs = {
            'password': {'write_only': True}
        }


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'bio', 'avatar',
            'student_id', 'batch_year',
            'github_username', 'linkedin_url', 'portfolio_url',
            'tech_skills', 'skill_level'
        ]


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name'
        ]
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class LeaderboardSerializer(serializers.ModelSerializer):
    """Simplified serializer for leaderboard display"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    rank = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'avatar',
            'points', 'batch_year', 'skill_level', 'rank'
        ]
