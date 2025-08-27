from django.core.management.base import BaseCommand
from data_preprocessing_service.kafka_consumer import start_kafka_consumer

class Command(BaseCommand):
    help = "Start the Kafka consumer"

    def handle(self, *args, **options):
        start_kafka_consumer()
