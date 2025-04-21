from pymongo import MongoClient
from decouple import config

# Load MongoDB URI from environment variables
MONGO_URI = config('MONGO_URI')

# Initialize the MongoDB client
client = MongoClient(MONGO_URI)

# Access the database
db = client[config('MONGO_DB_NAME')]

# Example: Access a specific collection
example_collection = db['example_collection']
