from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for local development

@app.route('/api/health', methods=['GET'])
def health_check():
    """A simple health check endpoint."""
    return jsonify({
        "status": "healthy",
        "message": "Python test server is running!"
    })

@app.route('/api/data', methods=['GET'])
def get_mock_data():
    """Returns some mock data for testing."""
    return jsonify({
        "items": [
            {"id": 1, "name": "Test Item A", "value": 100},
            {"id": 2, "name": "Test Item B", "value": 200},
            {"id": 3, "name": "Test Item C", "value": 300}
        ]
    })

if __name__ == '__main__':
    # Note: Port 3000 is reserved for the main web app in this environment.
    # Use port 5000 or similar for local testing.
    print("Starting test server on http://localhost:5000")
    app.run(debug=True, port=5000)
