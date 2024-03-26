import os
import base64
import json
import io
from flask import Flask, render_template, request, jsonify, send_file
from PIL import Image

app = Flask(__name__, static_folder='static')

DRAWINGS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'drawings')
os.makedirs(DRAWINGS_DIR, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/save', methods=['POST'])
def save():
    data = request.get_json()
    layer_data = data['layers']

    images = []
    for layer_url in layer_data:
        image_data = layer_url.split(',')[1]
        image_data = image_data.encode('utf-8')
        image_file = io.BytesIO(base64.b64decode(image_data))
        image = Image.open(image_file)
        images.append(image)

    filename = 'drawing.png'
    filepath = os.path.join(DRAWINGS_DIR, filename)
    images[0].save(filepath, save_all=True, append_images=images[1:])

    return jsonify(success=True)

@app.route('/load', methods=['POST'])
def load():
    file = request.files['file']
    filepath = os.path.join(DRAWINGS_DIR, file.filename)
    file.save(filepath)

    image = Image.open(filepath)
    layer_data = []

    for i in range(image.n_frames):
        image.seek(i)
        buffered = io.BytesIO()
        image.save(buffered, format='PNG')
        layer_data.append(base64.b64encode(buffered.getvalue()).decode('utf-8'))

    return jsonify(layer_data)

if __name__ == '__main__':
    app.run(debug=True)
