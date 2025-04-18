# yourapp/views.py
import pickle
import numpy as np
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# Load the model once when the server starts
with open("./SATELLITETRACKER/eol_service/my_model.pkl", "rb") as f:
    model = pickle.load(f)

class PredictView(APIView):
    def post(self, request):
        try:
            # Example: expecting JSON like {"features": [value1, value2, ...]}
            data = request.data
            features = np.array(data["features"]).reshape(1, -1)  # Make it 2D

            prediction = model.predict(features)
            return Response({"prediction": prediction[0]})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
