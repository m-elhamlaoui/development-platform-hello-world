from django.db import models

class TLEData(models.Model):
    satellite_id = models.IntegerField()
    satellite_name = models.CharField(max_length=255)
    tle_line1 = models.TextField()
    tle_line2 = models.TextField()
    last_updated = models.DateTimeField(auto_now=True)
