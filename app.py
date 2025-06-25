from flask import Flask, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

NEWS_API_KEY = '08fa7f8357ac48989bcc0c141c5f0212'  # Replace with your key

@app.route('/news/<city>')
def get_news(city):
    url = f'https://newsapi.org/v2/everything?q={city}&apiKey={NEWS_API_KEY}&language=en&pageSize=5'
    response = requests.get(url)
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(debug=True)
