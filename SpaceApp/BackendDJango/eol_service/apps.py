from django.apps import AppConfig
import threading
import sys

class EolServiceConfig(AppConfig):
    name = 'eol_service'

    def ready(self):
        if 'runserver' in sys.argv:
            print("⚙️ Starting Kafka consumer thread...")  # Debug message
            from .eol_kafka_consumer import start_kafka_consumer
            threading.Thread(target=start_kafka_consumer, daemon=True).start()

            print("✅ Kafka consumer thread started.")  # Debug message