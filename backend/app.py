from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from utils import extract_text_from_pdf, clean_text, identify_topics
from processor import analyze_dependencies, get_study_order, classify_topics_fully, generate_schedule, chat_with_mentor, update_dynamic_knowledge
import networkx as nx

app = Flask(__name__)
CORS(app)

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    topic = data.get('topic')
    message = data.get('message')
    response = chat_with_mentor(topic, message)
    return jsonify({"response": response})

# Handle uploads in a Vercel-compatible way (read-only filesystem except /tmp)
UPLOAD_FOLDER = '/tmp' if os.environ.get('VERCEL') else 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/api/analyze', methods=['POST'])
def analyze_syllabus():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    config = {
        "weeks": int(request.form.get('weeks', 4)),
        "hours": int(request.form.get('hours', 10)),
        "level": request.form.get('level', 'Beginner')
    }
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    # 1. Extraction
    if filename.endswith('.pdf'):
        raw_text = extract_text_from_pdf(filepath)
    else:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            raw_text = f.read()
            
    # 2. Cleaning
    cleaned_text = clean_text(raw_text)
    
    # 3. Topic Identification
    topics = identify_topics(cleaned_text)
    
    # 4. Dependency Analysis
    G = analyze_dependencies(topics)
    
    # 5. Sorting
    ordered_topics = get_study_order(G)
    
    # 6. Full Topic Analysis (Difficulty, Advice, Resources)
    topic_details = classify_topics_fully(ordered_topics)
    
    # 7. Adaptive Schedule Generation
    schedule = generate_schedule(ordered_topics, topic_details, config['weeks'], config['hours'], config['level'])
    
    # 8. Update Chat Mentor with context
    update_dynamic_knowledge(topic_details, cleaned_text)
    
    # Prepare graph data for visualization
    graph_data = {
        "nodes": [{"id": node, "group": topic_details.get(node, {}).get("difficulty", 2)} for node in G.nodes()],
        "links": [{"source": u, "target": v} for u, v in G.edges()]
    }
    
    return jsonify({
        "topics": ordered_topics,
        "topic_details": topic_details,
        "schedule": schedule,
        "graph": graph_data,
        "mentor_summary": f"Based on your {config['level']} level, I've created a path that focuses more on { 'foundations' if config['level'] == 'Beginner' else 'advanced optimization' if config['level'] == 'Advanced' else 'balanced learning' }."
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
