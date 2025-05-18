from confluent_kafka import Consumer, Producer, KafkaError
import json
import numpy as np
import pickle

# Load your trained ML model
with open("./eol_service/my_model.pkl", "rb") as f:
    model = pickle.load(f)

# Initialize Kafka Producer
producer = Producer({'bootstrap.servers': 'localhost:9092'})

def extract_features(data):
    """
    Extracts the relevant numerical features from the Kafka message for prediction.
    Returns a NumPy array shaped for model input.
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
    features_array = np.array([features])  # 2D array for model.predict
    print("🧪 Extracted features:", features_array)
    return features_array

def send_prediction_to_kafka(satellite_id, norad_id, prediction, features):
    """
    Sends prediction + flat features as JSON to the 'eol_predictions' Kafka topic.
    """
    prediction_data = {
        "satellite_id": satellite_id,
        "norad_id": norad_id,
        "prediction": float(prediction),
        "eccentricity": features[0],
        "orbital_velocity_approx": features[1],
        "raan": features[2],
        "collision_warning": features[3],
        "orbital_altitude": features[4],
        "line1_epoch": features[5],
        "motion_launch_interaction": features[6],
        "mean_motion": features[7]
    }
    try:
        producer.produce("eol_predictions", json.dumps(prediction_data).encode('utf-8'))
        producer.flush()
        print("📤 Flat prediction data sent to topic: eol_predictions")
    except Exception as e:
        print("❌ Error sending prediction to Kafka:", str(e))

def start_kafka_consumer():
    print("✅ Kafka EOL Consumer is starting...")

    consumer = Consumer({
        'bootstrap.servers': 'localhost:9092',
        'group.id': 'tle_data_group',
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

                features_array = extract_features(data)
                prediction = model.predict(features_array)

                # Send prediction + flat features
                send_prediction_to_kafka(
                    data.get("satellite_id"),
                    data.get("norad_id"),
                    prediction[0],
                    features_array[0]
                )

            except Exception as e:
                print("❌ Error processing message:", str(e))

    except KeyboardInterrupt:
        print("🛑 Kafka consumer interrupted")
    finally:
        consumer.close()
        print("🔒 Kafka consumer closed")

# Start the consumer when the script is run
if __name__ == "__main__":
    start_kafka_consumer()
