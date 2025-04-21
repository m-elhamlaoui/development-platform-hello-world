from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "start the health consumer"

    def handle(self, *args, **options):
        return super().handle(*args, **options)