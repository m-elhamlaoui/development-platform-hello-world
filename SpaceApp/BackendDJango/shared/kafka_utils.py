from kafka import KafkaProducer, KafkaConsumer
import json

# Kafka Producer
def send_to_kafka(topic, data):
    producer = KafkaProducer(bootstrap_servers='localhost:9092',
                             value_serializer=lambda v: json.dumps(v).encode('utf-8'))
    producer.send(topic, data)
    producer.flush()

# Kafka Consumer
def consume_from_kafka(topic, group_id):
    consumer = KafkaConsumer(topic,
                             bootstrap_servers='localhost:9092',
                             group_id=group_id,
                             value_deserializer=lambda x: json.loads(x.decode('utf-8')))
    for message in consumer:
        yield message.value