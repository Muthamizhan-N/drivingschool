from rest_framework import serializers
from .models import User, Batch, Trainer, Student, Attendance, Announcement, Payment

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'password')

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = '__all__'

class TrainerSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Trainer
        fields = ('id', 'user', 'user_details', 'phone', 'specialization')

class StudentSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    batch_details = BatchSerializer(source='preferred_batch', read_only=True)

    class Meta:
        model = Student
        fields = (
            'id', 'user', 'user_details', 'full_name', 'dob', 'address', 'phone', 'email',
            'license_status', 'preferred_batch', 'batch_details', 'emergency_contact',
            'status', 'registration_date'
        )

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    marked_by_name = serializers.CharField(source='marked_by.username', read_only=True)

    class Meta:
        model = Attendance
        fields = ('id', 'student', 'student_name', 'date', 'status', 'marked_by', 'marked_by_name', 'remarks', 'created_at')

class AnnouncementSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    target_batch_name = serializers.CharField(source='target_batch.name', read_only=True)

    class Meta:
        model = Announcement
        fields = ('id', 'sender', 'sender_name', 'title', 'content', 'target_batch', 'target_batch_name', 'created_at')

    def get_sender_name(self, obj):
        return obj.sender.get_full_name() or obj.sender.username

class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = Payment
        fields = ('id', 'student', 'student_name', 'amount_due', 'amount_paid', 'status', 'last_payment_date')
