from django.shortcuts import render
from django.http import JsonResponse
from .fetchDataService import fetch_tle_data

""" def get_tle_data(request, satellite_id):
    updated = fetch_tle_data(satellite_id)
    if updated:
        return JsonResponse({"message": "TLE data updated successfully."})
    else:
        return JsonResponse({"message": "TLE data is already up-to-date."}) """

from django_q.tasks import schedule
from .taskScheduler import update_tle_data  # Import the task function

def schedule_tle_update():
    schedule(
        update_tle_data,  
        schedule_type='H',  
    )
