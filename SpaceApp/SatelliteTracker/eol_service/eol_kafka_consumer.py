from confluent_kafka import Consumer, KafkaError
import json
import numpy as np
import pickle
import random

# Load your trained ML model
with open("./eol_service/my_model.pkl", "rb") as f:
    model = pickle.load(f)

def extract_features(data):
    """
    Extracts the relevant numerical features from the Kafka message for prediction.
    Adjust according to your model's training data.
    """
    features = [
        data.get("eccentricity", 0.0),
        data.get("orbital_velocity_approx", 0.0),
        data.get("raan", 0.0),
        data.get("collision_warning", 0),
        data.get("orbital_altitude", 0.0),
        data.get("line1_epoch", 0.0),
        data.get("motion_launch_interaction", 0.0),
        data.get("mean_motion", 0.0)
    ]
    features_array = np.array([features])
    print("🧪 Extracted features:", features_array)
    return features_array

def start_kafka_consumer():
    print("✅ Kafka EOL Consumer is starting...")

    consumer = Consumer({
        'bootstrap.servers': 'localhost:9092',
        'group.id': '"tle_data_group"' ,
        'auto.offset.reset': 'earliest'
    })

    consumer.subscribe(['endoflife'])
    print("🛰️ Subscribed to Kafka topic: endoflife")

    try:
        while True:
            msg = consumer.poll(timeout=1.0)
            if msg is None:
                continue
            if msg.error():
                print("❌ Kafka error:", msg.error())
                continue

            try:
                data = json.loads(msg.value().decode('utf-8'))
                print("📥 Received from Kafka:", data)

                features = extract_features(data)
                prediction = model.predict(features)
                print(f"📤 Prediction: {prediction[0]} for satellite ID {data.get('satellite_id')}")
            except Exception as e:
                print("❌ Error processing message:", str(e))

    except KeyboardInterrupt:
        print("🛑 Kafka consumer interrupted")
    finally:
        consumer.close()
        print("🔒 Kafka consumer closed")