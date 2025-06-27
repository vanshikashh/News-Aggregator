from flask import Flask, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

NEWS_API_KEY = '08fa7f8357ac48989bcc0c141c5f0212'  # Replace with your key

@app.route('/news/<city>')
def get_news(city):
    url = f'https://newsapi.org/v2/everything?q={city}&apiKey={NEWS_API_KEY}&language=en&pageSize=20'
    response = requests.get(url)
    data = response.json()

    # Enhanced filtering
    if "articles" in data:
        city_lower = city.lower()
        threshold = 5  # minimum number of times the word must appear in content

        def is_relevant(article):
            title = article.get("title", "").lower()
            description = article.get("description", "").lower()
            content = article.get("content", "").lower()

            # Condition 1: appears in the title
            if city_lower in title:
                return True

            # Condition 2: appears multiple times in content or description
            content_text = f"{description} {content}"
            occurrences = content_text.count(city_lower)
            return occurrences >= threshold

        data["articles"] = [article for article in data["articles"] if is_relevant(article)]

    return jsonify(data)


if __name__ == '__main__':
    app.run(debug=True)
