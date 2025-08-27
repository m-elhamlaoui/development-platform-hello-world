from django.shortcuts import render
import joblib
import numpy as np
from django.shortcuts import render
from django.http import JsonResponse
from confluent_kafka import Consumer, KafkaException, KafkaError


model = joblib.load('logreg.pkl')
scaler = joblib.load('scaler.pkl')

def predict(request):
    if request.method == 'GET':
        try:
            # Get input data from the query parameters or request body
            # Assuming the inputs are numeric values for the features you used
            time_since_launch = float(request.GET.get('time_since_launch'))
            orbital_altitude = float(request.GET.get('orbital_altitude'))
            battery_voltage = float(request.GET.get('battery_voltage'))
            solar_panel_temperature = float(request.GET.get('solar_panel_temperature'))
            attitude_control_error = float(request.GET.get('attitude_control_error'))
            data_transmission_rate = float(request.GET.get('data_transmission_rate'))
            thermal_control_status = int(request.GET.get('thermal_control_status'))
            
            # Create a feature array (reshaping it for prediction)
            input_data = np.array([[time_since_launch, orbital_altitude, battery_voltage,
                                    solar_panel_temperature, attitude_control_error,
                                    data_transmission_rate, thermal_control_status]])
            
            # Predict the result using the model
            prediction = model.predict(scaler.transform(input_data))
            
            # Return the prediction as a JSON response
            return JsonResponse({"prediction": int(prediction[0])})
        
        except Exception as e:
            return JsonResponse({"error": str(e)})

    return render(request, 'prediction/predict.html')
