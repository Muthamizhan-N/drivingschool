from django.db import migrations
import datetime

def seed_batches(apps, schema_editor):
    Batch = apps.get_model('core', 'Batch')
    Batch.objects.get_or_create(
        id=1,
        defaults={
            'name': 'Morning Batch (08:00 AM - 10:00 AM)',
            'start_time': datetime.time(8, 0),
            'end_time': datetime.time(10, 0)
        }
    )
    Batch.objects.get_or_create(
        id=2,
        defaults={
            'name': 'Evening Batch (05:00 PM - 07:00 PM)',
            'start_time': datetime.time(17, 0),
            'end_time': datetime.time(19, 0)
        }
    )

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_batches),
    ]
