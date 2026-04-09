# backend/Dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Explicitly download the spaCy model
RUN python -m spacy download en_core_web_sm

# Copy the rest of your app files
COPY . .

# Create uploads folder
RUN mkdir -p uploads

# Hugging Face Spaces listen on port 7860 by default
EXPOSE 7860

# Run the app using Gunicorn on port 7860
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:7860", "app:app"]
