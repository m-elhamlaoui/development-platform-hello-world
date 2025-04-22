from confluent_kafka import Consumer, KafkaError
import json
import numpy as np
import pickle

with open("./eol_service/my_model.pkl", "rb") as f:  # adjust path
    model = pickle.load(f)

def start_kafka_consumer():
    print("✅ Kafka EOL Consumer is starting...")  # Debug message

    consumer = Consumer({
        'bootstrap.servers': 'localhost:9092',
        'group.id': 'eol_predict_group',
        'auto.offset.reset': 'earliest'
    })

    consumer.subscribe(['endoflife'])
    print("🛰️ Subscribed to Kafka topic: endoflife")  # Debug message

    try:
        while True:
            msg = consumer.poll(timeout=1.0)
            if msg is None:
                continue
            if msg.error():
                print("❌ Kafka error:", msg.error())
                continue

            data = json.loads(msg.value().decode('utf-8'))
            print("📥 Received from Kafka:", data)

            features = extract_features(data)
            prediction = model.predict(features)
            print("📤 Prediction:", prediction[0])

    except Exception as e:
        print("❌ Exception in Kafka consumer:", str(e))
    finally:
        consumer.close()


def extract_features(data):
    import hashlib
    def encode(s): return int(hashlib.md5(s.encode()).hexdigest(), 16) % 1000000
    return np.array([[encode(data.get("tle_line1", "")), encode(data.get("tle_line2", ""))]])
