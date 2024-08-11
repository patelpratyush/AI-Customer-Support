from flask import Flask, request, jsonify, stream_with_context, Response
from flask_cors import CORS
from rag import RAG
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)
rag = RAG()

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    query = data.get('message', '')
    model = data.get('model', 'qwen/qwen-2-7b-instruct:free')
    files = request.files.getlist('file')
    links = request.form.getlist('link')

    # Process attachments
    texts = []
    for file in files:
        if file.filename.endswith('.pdf'):
            texts.extend(rag.load_pdf(file))
    for link in links:
        texts.extend(rag.load_web_content(link))

    if texts:
        rag.setup_vectorstore(texts)

    def generate():
        for chunk in rag.perform_rag(query, model):
            yield chunk

    return Response(stream_with_context(generate()), content_type='text/plain')

if __name__ == '__main__':
    app.run(debug=True)