import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

# Create or reset admin account
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'adminpassword123', role='admin')
    print("Admin superuser created successfully!")
else:
    user = User.objects.get(username='admin')
    user.set_password('adminpassword123')
    user.save()
    print("Admin password updated successfully!")
