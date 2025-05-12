from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json
from .tle_manager import TLEManager
from .collision_analyzer import CollisionAnalyzer
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CollisionPredictionView(APIView):
    """
    API endpoint to predict collisions for a list of satellites.
    Expects JSON body: {"satellites": ["GRACE-FO 1", "GRACE-FO 2", ...]}
    Generates predictions over a 3-hour window, sends high-risk predictions to Kafka,
    and returns all reported predictions.
    """

    def post(self, request):
        try:
            # Parse request body
            data = request.data
            satellites = data.get('satellites', [])
            if not satellites or len(satellites) < 2:
                logger.error("Invalid input: At least two satellites required")
                return Response(
                    {'error': 'At least two satellites are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            logger.info(f"Received request to predict collisions for satellites: {satellites}")

            # Initialize CollisionAnalyzer
            analyzer = CollisionAnalyzer(selected_satellites=satellites)
            if not analyzer.initialize():
                logger.error("Failed to initialize analyzer: No valid TLE data")
                return Response(
                    {'error': 'No valid TLE data found for the provided satellites'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Run predictions
            predictions = analyzer.run_prediction(hours=1)

            if not predictions:
                logger.warning("No collision predictions reported")
                return Response(
                    {'status': 'No high-risk predictions reported', 'predictions': []},
                    status=status.HTTP_200_OK
                )

            logger.info(f"Generated {len(predictions)} predictions")
            return Response({
                'status': f'Reported {len(predictions)} predictions',
                'predictions': predictions
            }, status=status.HTTP_200_OK)

        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in request body: {e}")
            return Response(
                {'error': 'Invalid JSON format'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error processing request: {e}", exc_info=True)
            return Response(
                {'error': f'Internal server error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )