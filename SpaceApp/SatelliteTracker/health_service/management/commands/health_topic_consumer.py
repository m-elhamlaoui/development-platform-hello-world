from django.core.management.base import BaseCommand
from health_service.predicting_health import start_health_data_consumer


class Command(BaseCommand):
    help = "start the health consumer"

    def handle(self, *args, **options):
        start_health_data_consumer()