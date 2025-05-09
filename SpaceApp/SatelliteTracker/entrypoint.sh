#!/bin/bash

echo "🚀 Starting all Kafka consumers in background..."
python manage.py health_topic_consumer &
python manage.py endoflife_topic_consumer &
python manage.py collision_topic_consumer &

echo "🌐 Starting Django web server..."
python manage.py runserver 0.0.0.0:8000
