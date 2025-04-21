from confluent_kafka import Consumer, Producer, KafkaException, KafkaError
from .models import TLEData
import json
import random

def start_kafka_consumer():
    consumer_config = {
        'bootstrap.servers': 'localhost:9092', 
        'group.id': 'tle_data_group',
        'auto.offset.reset': 'earliest'
    }

    consumer = Consumer(consumer_config)
    topic = 'dataUpdates'  
    producer = Producer({'bootstrap.servers': 'localhost:9092'})  

    try:
        consumer.subscribe([topic])
        print(f"Subscribed to topic: {topic}")

        while True:
            msg = consumer.poll(timeout=1.0)
            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue
                else:
                    print(f"Consumer error: {msg.error()}")
                    break

            data = msg.value().decode('utf-8')
            processed_data = process_tle_data(data)

            if processed_data:
                
                processed_data_json = json.dumps(processed_data)

                producer.produce('processedDataTopic', value=processed_data_json)
                producer.flush()
                print("Processed data sent back to Kafka.")

    except KeyboardInterrupt:
        print("Consumer stopped by user")

    finally:
        consumer.close()


def process_tle_data(data):
    """
    Processes the TLE data received from Kafka and adds synthetic data.
    """
    try:
        # Parse the incoming JSON data
        tle_data = json.loads(data)

        satellite_id = tle_data.get('satellite_id')
        satellite_name = tle_data.get('satellite_name')
        tle_line1 = tle_data.get('tle_line1')
        tle_line2 = tle_data.get('tle_line2')

        # Generate synthetic data
        synthetic_data = {
            "time_since_launch": random.randint(1, 3650),  # Days since launch
            "orbital_altitude": random.uniform(300, 2000),  # Kilometers
            "battery_voltage": random.uniform(3.0, 5.0),    # Volts
            "solar_panel_temperature": random.uniform(-50, 50),  # Degrees Celsius
            "attitude_control_error": random.uniform(0.0, 5.0),   # Degrees
            "data_transmission_rate": random.uniform(10, 100),    # Mbps
            "thermal_control_status": random.choice([0,1])
        }

        
        tle_data.update(synthetic_data)

        return tle_data

    except json.JSONDecodeError:
        print("Error decoding JSON data")
    except Exception as e:
        print(f"An error occurred while processing the TLE data: {e}")
        return None
