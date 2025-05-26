# myapp/tasks.py
from celery import shared_task
from .fetchDataService import fetch_tle_data  # Assuming this is your service function

@shared_task
def update_tle_data():
    satellite_ids = [4000, 5000]  # Replace with your actual satellite IDs
    for satellite_id in satellite_ids:
        fetch_tle_data(satellite_id)
    return f'Updated TLE data for satellites: {satellite_ids}'
