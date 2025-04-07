from rest_framework import serializers # # Importing DRF's serializers for transforming complex model data to JSON
from .models import User, TeacherProfile, Class, Subject, TeacherClassSubject # # Importing related models to be serialized

# Serializer for the Subject model
class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'description']  # Serializer for the Subject model. 
                                                # (i.e Converts Subject model fields to JSON)

# Serializer for the Class model
class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = ['id', 'name', 'grade_level', 'description'] # Serializes all main attributes of a class

# Serializer for mapping teachers to the class and subject they teach
class TeacherClassSubjectSerializer(serializers.ModelSerializer):
    # Nested read-only serializers for detailed output
    class_taught = ClassSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    
    # Write-only primary key inputs for creation/editing (Composition, Data abstraction)
    class_taught_id = serializers.PrimaryKeyRelatedField(
        queryset=Class.objects.all(), source='class_taught', write_only=True
    )
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), source='subject', write_only=True
    )

    class Meta:
        model = TeacherClassSubject
        # Combines both read and write formats for flexible frontend/backend use
        fields = ['id', 'class_taught', 'subject', 'class_taught_id', 'subject_id']

# Basic User serializer for showing user details
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name'] # Selective exposure of sensitive data 

# Serializer for the teacher profile
class TeacherProfileSerializer(serializers.ModelSerializer):
    # nested user info displayed, but not editable
    user = UserSerializer(read_only=True)
    # Read-only list of all class-subjects this teacher teaches
    class_subjects = TeacherClassSubjectSerializer(
        source='teacherclasssubject_set',
        many=True,
        read_only=True
    )

    class Meta:
        model = TeacherProfile
        fields = ['id', 'bio', 'user', 'class_subjects']    # provides teachers profile

     # Custom update method for updating the teacher's bio only
    def update(self, instance, validated_data):
        instance.bio = validated_data.get('bio', instance.bio)
        # Object-oriented programming (method override and update logic)
        instance.save()
        return instance