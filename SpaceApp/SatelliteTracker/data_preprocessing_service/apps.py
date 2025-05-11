from django.apps import AppConfig
import threading
import sys

class DataPreprocessingServiceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'data_preprocessing_service'

    """ def ready(self):
        if 'runserver' in sys.argv:
            print("⚙️ Starting Kafka consumer thread for preprocessing service...")  # Debug message
            from .kafka_consumer import start_kafka_consumer
            threading.Thread(target=start_kafka_consumer, daemon=True).start()

            print("✅ Kafka consumer thread started.")  # Debug message """
