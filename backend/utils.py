import pypdf
import re
import spacy

nlp = None

def load_nlp():
    global nlp
    if nlp is None:
        # We rely on requirements.txt to have installed this as a package
        nlp = spacy.load("en_core_web_sm")
    return nlp

def extract_text_from_pdf(pdf_path):
    text = ""
    with open(pdf_path, 'rb') as file:
        reader = pypdf.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    return text

def clean_text(text):
    # Remove special characters except basic punctuation
    text = re.sub(r'[^\w\s\.,;:\-\(\)]', ' ', text)
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def identify_topics(text):
    nlp = load_nlp()
    
    # Pre-process: split common multi-topic delimiters
    # If a line has many commas and is long, it likely contains multiple topics
    lines = text.split('\n')
    if len(lines) < 5:
        doc = nlp(text)
        lines = [sent.text.strip() for sent in doc.sents]
    
    expanded_lines = []
    for line in lines:
        if len(line) > 50 and (',' in line or ';' in line):
            # Split by common delimiters but keep the structure
            parts = re.split(r'[,;]', line)
            expanded_lines.extend([p.strip() for p in parts if len(p.strip()) > 3])
        else:
            expanded_lines.append(line)

    topics = []
    for line in expanded_lines:
        line = line.strip()
        if not line: continue
        
        # Check for Unit/Module markers
        if re.match(r'^(UNIT|MODULE|CHAPTER)\s+[IVX\d\w]+', line, re.IGNORECASE):
            topics.append(line)
        elif len(line) < 120: # Slightly larger threshold for detailed topics
            # Further filter: must have some significance (nouns)
            sub_doc = nlp(line)
            if any(token.pos_ in ["NOUN", "PROPN"] for token in sub_doc):
                # Clean up: remove trailing dots or numbers
                clean_line = re.sub(r'^[\d\.\-\s]+', '', line)
                if clean_line:
                    topics.append(clean_line)

    # De-duplicate while preserving order
    seen = set()
    unique_topics = []
    for t in topics:
        key = t.lower()
        if key not in seen:
            unique_topics.append(t)
            seen.add(key)
    
    return unique_topics
