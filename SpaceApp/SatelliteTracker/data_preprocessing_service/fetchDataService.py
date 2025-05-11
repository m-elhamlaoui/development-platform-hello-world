import requests
from .models import TLEData

def fetch_tle_data(satellite_id):
    api_url = f"https://www.n2yo.com/rest/v1/satellite/tle/{satellite_id}/&ZJCQA5-N8HHGU-X365EG-5GCX"
    response = requests.get(api_url)
    if response.status_code == 200:
        tle_data = response.json()
        satellite_name = tle_data.get("info", {}).get("satname", "Unknown Satellite")
        tle_line1 = tle_data.get("tle", "").split("\n")[0]
        tle_line2 = tle_data.get("tle", "").split("\n")[1]

        # Check if the TLE data is already in the database
        existing_tle = TLEData.objects.filter(satellite_name=satellite_name).first()
        if not existing_tle or existing_tle.tle_line1 != tle_line1 or existing_tle.tle_line2 != tle_line2:
            # Update or create the TLE data
            TLEData.objects.update_or_create(
                satellite_name=satellite_name,
                defaults={"tle_line1": tle_line1, "tle_line2": tle_line2},
            )
            return True  # Data was updated
    return False  # Data was not updated
