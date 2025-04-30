from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from kafka import KafkaProducer
import logging
import json
from typing import List
from .collision import SatelliteCollisionPredictor  # Assuming this is where your class is

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Kafka Producer Setup
producer = KafkaProducer(
    bootstrap_servers='localhost:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# Prediction function
def predict_collisions(satellite_list: List[str]) -> List[dict]:
    predictor = SatelliteCollisionPredictor(satellite_list)
    if not predictor.fetch_tle_data():
        logger.error("Failed to fetch TLE data. Returning empty list.")
        return []  # Return empty list, not {"prediction collision": []}
    logger.info("Starting collision prediction...")
    collisions = predictor.run_prediction()  # Returns list of collision objects
    logger.info("Collision prediction completed.")
    return collisions  # Return the list directly

# API View
class PredictCollisionView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        try:
            data = request.data
            logger.info(f"Received data: {data}")

            # Make sure "satellites" is a list
            satellites = data.get("satellites")
            if not isinstance(satellites, list):
                return Response({"error": "satellites must be a list."}, status=status.HTTP_400_BAD_REQUEST)

            collision_results = predict_collisions(satellites)
            # Send the collision results to Kafka
            logger.info(f"Sending Kafka message: {json.dumps(collision_results)}")
            producer.send('satellite-collisions', collision_results)
            producer.flush()

            return Response(collision_results, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Error in PredictCollisionView:")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)