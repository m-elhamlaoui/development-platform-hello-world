from confluent_kafka import Consumer,Producer, KafkaError
import joblib
import numpy as np
import json


def start_health_data_consumer():
    consumer_config = {
        'bootstrap.servers': 'localhost:9092',
        'group.id': 'tle_data_group',
        'auto.offset.reset': 'earliest'
    }

    consumer = Consumer(consumer_config)
    topic = 'health'
    producer = Producer({'bootstrap.severs': 'localhost:9092'})
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


def predict_health_status(data):
    scaler = joblib.load('scaler.pkl')
    model = joblib.load('logreg.pkl')
    features = [
        data.get('time_since_launch'),
        data.get('orbital_altitude'),
        data.get('battery_voltage'),
        data.get('solar_panel_temperature'),
        data.get('attitude_control_error'),
        data.get('data_transmission_rate'),
        data.get('thermal_control_status')
    ]

    features = np.array(features).reshape(1, -1)
    scaled_features = scaler.transform(features)

    # Make prediction
    #prediction = model.predict(scaled_features)[0]

     # Predict class
    prediction = int(model.predict(scaled_features)[0])

    # Predict probability
    probability = float(model.predict_proba(scaled_features)[0][1])  # Prob. of class '1'


    # Explainability using SHAP
    explainer = shap.Explainer(model, scaler.transform)
    shap_values = explainer(scaled_features)
    explanation = dict(zip(feature_names, shap_values.values[0].tolist()))
    return {"prediction": prediction,
        "probability": probability,
        "explanation": explanation}
