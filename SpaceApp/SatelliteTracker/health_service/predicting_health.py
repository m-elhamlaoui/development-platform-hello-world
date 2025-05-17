from confluent_kafka import Consumer,Producer, KafkaError
import joblib
import numpy as np
import json
import shap
import os
from django.conf import settings



def start_health_data_consumer():
    consumer_config = {
        'bootstrap.servers': 'localhost:9092',
        'group.id': 'tle_data_group',
        'auto.offset.reset': 'earliest'
    }

    consumer = Consumer(consumer_config)
    topic = 'health'
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

            raw_data = msg.value().decode('utf-8')
            data = json.loads(raw_data)
            prediction_result = predict_health_status(data)

            if prediction_result:
                
                processed_data = {
                    "features": data,
                    "prediction": prediction_result["prediction"],
                    "probability": prediction_result["probability"],
                    "explanation": prediction_result["explanation"]
                }
                processed_data_json = json.dumps(processed_data)

                producer.produce('healthPrediction', value=processed_data_json)
                producer.flush()
                print("Processed data sent back to Kafka.")

    except KeyboardInterrupt:
        print("Consumer stopped by user")

    finally:
        consumer.close()

import pandas as pd

def predict_health_status(data):

    scaler_path = os.path.join(settings.BASE_DIR, 'health_service', 'scaler.pkl')
    model_path = os.path.join(settings.BASE_DIR, 'health_service', 'xgboost.pkl')

    # Load model and scaler
    scaler = joblib.load(scaler_path)
    model = joblib.load(model_path)
    
    features = [
        data.get('time_since_launch'),
        data.get('orbital_altitude'),
        data.get('battery_voltage'),
        data.get('solar_panel_temperature'),
        data.get('attitude_control_error'),
        data.get('data_transmission_rate'),
        data.get('thermal_control_status')
    ]

    # features = np.array(features).reshape(1, -1)
    # scaled_features = scaler.transform(features)

    # Make prediction
    #prediction = model.predict(scaled_features)[0]

     # Predict class
    # prediction = int(model.predict(scaled_features)[0])

    # # Predict probability
    # probability = float(model.predict_proba(scaled_features)[0][1])  # Prob. of class '1'

    feature_names = [
    'time_since_launch',
    'orbital_altitude',
    'battery_voltage',
    'solar_panel_temperature',
    'attitude_control_error',
    'data_transmission_rate',
    'thermal_control_status'
]
    
    features = pd.DataFrame([[data.get(f) for f in feature_names]], columns=feature_names)
    scaled_features = scaler.transform(features)

    # Predict class and probability
    prediction = int(model.predict(scaled_features)[0])
    probability = float(model.predict_proba(scaled_features)[0][1])  # probability of class 1



    # Explainability using SHAP
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(scaled_features)
    
    explanation = dict(zip(feature_names, shap_values[0].tolist()))
    return {"prediction": prediction,
        "probability": probability,
        "explanation": explanation}
