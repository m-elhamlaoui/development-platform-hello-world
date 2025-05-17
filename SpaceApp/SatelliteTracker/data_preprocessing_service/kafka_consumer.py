from confluent_kafka import Consumer, Producer, KafkaException, KafkaError
from .models import TLEData
import json
import random
import pandas as pd
import os
from django.conf import settings


data_path = os.path.join(settings.BASE_DIR, 'data_preprocessing_service', 'fully_augmented_satellite_dataset.csv')
data = pd.read_csv(data_path)

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
            processed_data = unified_process_tle_data(data)

            if processed_data:

                processed_data_json = json.dumps(processed_data)

                def delivery_report(err, msg):
                    if err is not None:
                        print(f"❌ Delivery failed: {err}")
                    else:
                        print(f"✅ Message delivered to {msg.topic()} [{msg.partition()}]")
                
                
                

                producer.produce('processedDataTopic', value=processed_data_json, callback=delivery_report)
                
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
        launch_date = tle_data.get('launch_date')
        time_since_launch = tle_data.get('time_since_launch')

        # Generate synthetic data
        synthetic_data = {
            "time_since_launch": random.randint(1, 3650),  # Days since launch
            "orbital_altitude": random.uniform(300, 2000),  # Kilometers
            "battery_voltage": random.uniform(3.0, 5.0),    # Volts
            "solar_panel_temperature": random.uniform(-50, 50),  # Degrees Celsius
            "attitude_control_error": random.uniform(0.0, 5.0),   # Degrees
            "data_transmission_rate": random.uniform(10, 100),    # Mbps
            "thermal_control_status": random.choice([0,1]),
            "time_since_launch": time_since_launch,               # ✅ keep real one
            "launch_date": launch_date
        }

        
        tle_data.update(synthetic_data)

        return tle_data

    except json.JSONDecodeError:
        print("Error decoding JSON data")
    except Exception as e:
        print(f"An error occurred while processing the TLE data: {e}")
        return None
    
def process_tle_data_biased(data):
    """
    Processes TLE data and adds synthetic telemetry + ML prediction.
    """
    try:
        tle_data = json.loads(data)

        satellite_id = tle_data.get('satellite_id')
        satellite_name = tle_data.get('satellite_name')
        time_since_launch = tle_data.get('time_since_launch')
        launch_date = tle_data.get('launch_date')
        launch_date = tle_data.get('launch_date')
        time_since_launch = tle_data.get('time_since_launch')

        # ✅ Generate class 1 biased sample
        sample = generate_class1_biased_sample(tle_data)

        
        synthetic_data = {
            "time_since_launch":sample['time_since_launch'],
            "orbital_altitude":sample['orbital_altitude'],
            "battery_voltage":sample['battery_voltage'],
            "solar_panel_temperature":sample['solar_panel_temperature'],
            "solar_panel_temperature":sample['attitude_control_error'],
             "data_transmission_rate":sample['data_transmission_rate'],
             "data_transmission_rate":sample['thermal_control_status'],
            "time_since_launch": time_since_launch,               # ✅ keep real one
            "launch_date": launch_date
        }

        tle_data.update(synthetic_data)

        return tle_data


    except json.JSONDecodeError:
        print("❌ Error decoding JSON data")
    except Exception as e:
        print(f"❌ Error processing TLE data: {e}")
        return None
    

import numpy as np
def generate_class1_biased_sample():
    """
    Randomly picks a row from class 1 samples in the CSV dataset.
    """
    row = data.sample(1).drop(columns=["satellite_health"])
    noise = np.random.normal(0, 0.05, row.shape)  # small noise
    noisy_values = row.values + noise

    # Fix thermal_control_status to binary
    noisy_values[0, -1] = round(np.clip(noisy_values[0, -1], 0, 1))

    return {
        "time_since_launch": int(noisy_values[0][0]),
        "orbital_altitude": float(noisy_values[0][1]),
        "battery_voltage": float(noisy_values[0][2]),
        "solar_panel_temperature": float(noisy_values[0][3]),
        "attitude_control_error": float(noisy_values[0][4]),
        "data_transmission_rate": float(noisy_values[0][5]),
        "thermal_control_status": int(noisy_values[0][6])
    }

def unified_process_tle_data(data):
    """
    Processes TLE data:
    - 1/10 chance → regular synthetic preprocessing
    - 9/10 chance → biased class 1 sample
    """
    try:
        if random.random() < 0.1:  # 10% chance
            print("🔁 Using regular preprocessing.")
            return process_tle_data(data)
        else:
            print("📊 Using biased class 1 sample.")
            return process_tle_data_biased(data)
    except Exception as e:
        print(f"❌ Unified processing failed: {e}")
        return None
