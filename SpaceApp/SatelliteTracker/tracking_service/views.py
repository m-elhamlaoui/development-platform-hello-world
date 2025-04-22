from django.shortcuts import render

# Create your views here.
from django.shortcuts import render

# Create your views here.
# yourapp/views.py
import pickle
import numpy as np
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging

from typing import List
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.permissions import AllowAny




# Load the model once when the server starts
with open("./eol_service/my_model.pkl", "rb") as f:
    model = pickle.load(f)





class PredictCollisionView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def post(self, request):
        try:
            data = request.data
            print("Recived data : ",data)
            satellites = np.array(data["satellites"]).reshape(1, -1)  # Make it 2D

            collision_results = "" ""
            return Response({"prediction collision": collision_results})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)