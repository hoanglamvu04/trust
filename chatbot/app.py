from flask import Flask, request, jsonify
from flask_cors import CORS
from chatbot1 import get_response

app = Flask(__name__)
CORS(app)

@app.route("/api/chatbot", methods=["POST"])
def chatbot():
    data = request.get_json()
    message = data.get("message")
    topic = data.get("topic")  # ví dụ: 'tra_cuu', 'huong_dan'

    if not message or not topic:
        return jsonify({"response": "Thiếu dữ liệu"}), 400

    answer = get_response(message, topic)
    return jsonify({"response": answer})

if __name__ == "__main__":
    app.run(debug=True)
