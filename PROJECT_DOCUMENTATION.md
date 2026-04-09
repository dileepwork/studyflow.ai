# 🎓 StudyFlow AI - Project Documentation

**StudyFlow AI** is a smart, AI-powered academic mentor designed to help students conquer complex syllabi. It transforms messy PDF or Text curriculum documents into strategic, adaptive study roadmaps tailored to the student's proficiency level.

---

## 🚀 Key Features

1.  **Smart Syllabus Extraction**: Automatically parses PDF and Text files to identify chapters, modules, and sub-topics using NLP.
2.  **AI Dependency Analysis**: Uses a lightweight Jaccard Similarity algorithm to detect prerequisite relationships between topics (ensuring you learn the basics before the advanced stuff).
3.  **Adaptive Scheduling**: Generates a week-by-week study plan based on:
    *   **Student Level**: Beginner (focuses on foundations), Intermediate, or Advanced (focuses on complex core).
    *   **Available Time**: Customizable weeks and daily study hours.
4.  **AI Mentor Contextual Advice**: Provides specific "Study Tips" for every topic based on its category (Introduction, Math, Coding, etc.).
5.  **Interactive "Doubt Solver"**: A dedicated chat assistant for every topic that helps students understand concepts without leaving the dashboard.
6.  **Visual Analytics**: A complexity breakdown chart (Pie Chart) showing the distribution of Easy, Medium, and Hard topics.
7.  **Premium UI/UX**: A glassmorphic, responsive design with smooth animations (Framer Motion) and dark/light mode support.

---

## 🛠️ Technology Stack

### **Frontend**
- **React (Vite)**: Modern, fast frontend framework.
- **Framer Motion**: Smooth micro-animations and page transitions.
- **Lucide React**: Clean, consistent iconography.
- **Recharts**: Dynamic data visualization for syllabus complexity.
- **React Dropzone**: Drag-and-drop file upload interface.
- **Axios**: API communication with the Flask backend.

### **Backend**
- **Python Flask**: Lightweight and robust API server.
- **spaCy (`en_core_web_sm`)**: Natural Language Processing for topic identification and text cleaning.
- **NetworkX**: Graph theory library used to build the Directed Acyclic Graph (DAG) of topic dependencies.
- **PyPDF**: Reliable PDF text extraction.

---

## 📁 Project Structure

```text
AIML_STUDENT_ASSISSTANT/
├── backend/
│   ├── app.py              # Main Flask API routes
│   ├── processor.py        # Logic for dependency analysis, scheduling, & chat
│   ├── utils.py            # PDF extraction and NLP pre-processing
│   └── requirements.txt    # Python dependencies optimized for cloud limits
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main React Component & UI Logic
│   │   ├── index.css       # Design System (Glassmorphic styles)
│   │   └── main.jsx        # React entry point
│   ├── public/             # Static assets
│   ├── vite.config.js      # Proxy settings for local development
│   └── package.json        # Frontend dependencies
├── vercel.json             # Monorepo deployment configuration
└── README.md               # User quick-start guide
```

---

## ⚙️ AI Logic & Algorithms

### **1. Topic identification**
The system uses `spaCy` to analyze the grammatical structure of the syllabus. It identifies "NOUN" and "PROPN" (Proper Nouns) as core topics while filtering out page numbers and noise.

### **2. Dependency Mapping**
To stay within the 250MB cloud limit, we use a lightweight **Jaccard Similarity** algorithm:
- It tokenizes every topic.
- Compares overlapping words between topics.
- If similarity is >20% and Topic A appears before Topic B in the syllabus, a dependency edge (A → B) is created.

### **3. Adaptive Scheduling**
The schedule uses a **Weighted Distribution Algorithm**:
- **Difficulty Weights**: Easy = 1.0, Medium = 2.0, Hard = 3.0.
- **Level Modifiers**: Beginner level adds a +1.5x weight to "Easy" topics to ensure they aren't rushed.
- The total "weight" is divided by the number of weeks to create balanced goals.

---

## 💻 Local Installation

### **Backend Setup**
1. Navigate to the `backend` folder.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```
3. Run the server:
   ```bash
   python app.py
   ```
   *The server runs on `http://127.0.0.1:5000`*

### **Frontend Setup**
1. Navigate to the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
   *The app runs on `http://localhost:5173` (or 5174)*

---

## ☁️ Deployment (Vercel)

The project is configured as a **Full-Stack Monorepo**.
- **Frontend**: Deploys as a static build.
- **Backend**: Deploys as Python Serverless Functions.
- **Routing**: `vercel.json` ensures all `/api` calls are automatically routed to the Python `app.py`.

**Optimization Note**: The project has been specifically pruned to fit within Vercel's **250MB unzipped limit** by replacing heavy libraries like `scikit-learn` with native Python algorithms.

--- 

## 👨‍💻 Author
**DILEEP**
*A Product from 6IXMINDSLABS*
StudyFlow AI © 2026
