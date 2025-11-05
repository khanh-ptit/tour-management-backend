from flask import Flask, request, jsonify
from resemblyzer import VoiceEncoder, preprocess_wav
import numpy as np
import requests
from io import BytesIO
from scipy.spatial.distance import cosine
import os
import tempfile

# --- Tạo thư mục tạm riêng để tránh lỗi permission trên Windows ---
custom_tmp = os.path.join(os.getcwd(), "tmp_audio")
os.makedirs(custom_tmp, exist_ok=True)
tempfile.tempdir = custom_tmp

# --- Khởi tạo Flask và VoiceEncoder ---
app = Flask(__name__)
encoder = VoiceEncoder()

def download_audio_from_url(url):
    """Tải audio từ URL về file tạm và trả về path"""
    try:
        response = requests.get(url)
        response.raise_for_status()
        # Lưu vào file tạm trong thư mục tmp_audio
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
            tmp_file.write(response.content)
            return tmp_file.name
    except Exception as e:
        raise RuntimeError(f"Lỗi đọc âm thanh từ URL: {e}")

@app.route("/verify", methods=["POST"])
def verify():
    try:
        data = request.get_json()
        ref_url = data.get("ref_url")
        test_url = data.get("test_url")

        if not ref_url or not test_url:
            return jsonify({"error": "Thiếu ref_url hoặc test_url"}), 400

        # --- Tải và xử lý audio ---
        ref_file = download_audio_from_url(ref_url)
        test_file = download_audio_from_url(test_url)

        ref_audio = preprocess_wav(ref_file)
        test_audio = preprocess_wav(test_file)

        # --- Tạo embeddings ---
        ref_emb = encoder.embed_utterance(ref_audio)
        test_emb = encoder.embed_utterance(test_audio)

        # --- Tính cosine similarity ---
        score = 1 - cosine(ref_emb, test_emb)

        # --- Xoá file tạm sau khi xử lý ---
        os.remove(ref_file)
        os.remove(test_file)

        return jsonify({"score": float(score)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
