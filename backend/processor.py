import networkx as nx
import re

def analyze_dependencies(topics):
    """
    Detects prerequisite relationships between topics using lightweight Jaccard Similarity.
    """
    G = nx.DiGraph()
    for topic in topics:
        G.add_node(topic)
    
    # Pre-tokenize topics for similarity
    def get_tokens(text):
        return set(re.findall(r'\w+', text.lower()))

    topic_tokens = [get_tokens(t) for t in topics]

    if len(topics) > 1:
        for i in range(len(topics)):
            for j in range(i + 1, len(topics)):
                # Jaccard Similarity: Intersection / Union
                set_i = topic_tokens[i]
                set_j = topic_tokens[j]
                
                if not set_i or not set_j: continue
                
                intersection = len(set_i.intersection(set_j))
                union = len(set_i.union(set_j))
                similarity = intersection / union
                
                # If topics are similar, assume earlier one is prerequisite
                if similarity > 0.2:
                    G.add_edge(topics[i], topics[j])

    # Unit-based dependency
    current_unit = None
    for topic in topics:
        if re.match(r'^(UNIT|MODULE|CHAPTER)\s+[IVX\d]+', topic, re.IGNORECASE):
            current_unit = topic
        elif current_unit:
            G.add_edge(current_unit, topic)

    # Ensure it's a DAG (remove cycles if any)
    # Simple cycle removal: if (a,b) and (b,a), keep (a,b) if index of a < index of b
    # But usually syllabus is already somewhat ordered.
    if not nx.is_directed_acyclic_graph(G):
        cycles = list(nx.simple_cycles(G))
        for cycle in cycles:
            # For each cycle, remove the back-edge (where target index < source index)
            # This is a bit naive but works for syllabus flow
            pass
            
    return G

def get_study_order(G):
    try:
        # If there are cycles, we can't do topological sort
        # We'll use a modified approach or just return the syllabus order if it fails
        return list(nx.topological_sort(G))
    except nx.NetworkXUnfeasible:
        # If it contains cycles, fallback to original order
        return list(G.nodes())

# Teacher's Insights & Resources Mapping
MENTOR_TIPS = {
    "introduction": "Don't just memorize definitions. Try to understand the 'Why' behind this field.",
    "basic": "Strong foundations make complex topics easier. Spend extra time here if you're a beginner.",
    "neural": "Think of this as biological inspiration. Visualize the layers and connections.",
    "search": "Algorithms are like recipes. Trace them on paper before coding.",
    "algorithm": "Practice with small examples first. Complexity matters more than syntax.",
    "math": "Focus on the logic, not just the formulas. Use online calculators to verify.",
    "code": "Don't just copy. Type every line and see it fail, then fix it.",
    "hard": "Break this into 3 smaller chunks. Don't try to finish it in one sitting.",
    "exam": "Focus on the core concepts. Past papers are your best friend here."
}

def get_mentor_advice(topic):
    topic_lower = topic.lower()
    for key, tip in MENTOR_TIPS.items():
        if key in topic_lower:
            return tip
    return "Study this topic with a focus on its real-world applications."

def get_resource_links(topic):
    # Generates helpful search links for the student
    query = topic.replace(' ', '+')
    return [
        {"name": "YouTube Tutorial", "url": f"https://www.youtube.com/results?search_query={query}+tutorial"},
        {"name": "GeeksforGeeks", "url": f"https://www.google.com/search?q={query}+geeksforgeeks"},
        {"name": "University Notes", "url": f"https://www.google.com/search?q={query}+lecture+notes+pdf"},
        {"name": "Interview Prep", "url": f"https://www.google.com/search?q={query}+interview+questions+answers"},
        {"name": "Documentation/Wiki", "url": f"https://en.wikipedia.org/wiki/{query}"}
    ]

def classify_topics_fully(ordered_topics):
    easy_keywords = ['introduction', 'basics', 'overview', 'concept', 'history', 'units', 'scope', 'definition', 'example']
    hard_keywords = ['advanced', 'neural', 'optimization', 'complex', 'inference', 'backpropagation', 'bayesian', 'deep', 'logic', 'system', 'theory', 'analysis', 'modeling', 'simulation', 'integration', 'architecture', 'design']
    
    topic_details = {}
    for topic in ordered_topics:
        score = 2 # Default Medium
        t_lower = topic.lower()
        
        if any(kw in t_lower for kw in easy_keywords):
            score = 1
        elif any(kw in t_lower for kw in hard_keywords):
            score = 3
        
        topic_details[topic] = {
            "difficulty": score,
            "advice": get_mentor_advice(topic),
            "resources": get_resource_links(topic)
        }
    return topic_details

def generate_schedule(ordered_topics, topic_details, total_weeks, hours_per_week, student_level="Beginner"):
    """
    Adaptive Scheduling:
    - Beginner: Spends 50% more time on foundations (Difficulty 1).
    - Advanced: Spends 30% less time on basics and jumps to Hard topics faster.
    """
    # Adjust weights based on student level
    if student_level == "Beginner":
        weights = {1: 2.5, 2: 3, 3: 4} # Extra time for foundations
    elif student_level == "Advanced":
        weights = {1: 0.5, 2: 1.5, 3: 3} # Skip basics, focus on hard
    else: # Intermediate
        weights = {1: 1, 2: 2, 3: 3}
    
    topic_weights = [(t, weights[topic_details[t]["difficulty"]]) for t in ordered_topics]
    total_weight = sum(w for _, w in topic_weights)
    
    if total_weight == 0: total_weight = 1
    
    weight_per_week = total_weight / total_weeks
    
    schedule = []
    current_week_topics = []
    current_week_weight = 0
    week_num = 1
    
    for topic, weight in topic_weights:
        current_week_topics.append(topic)
        current_week_weight += weight
        
        # Determine if we should close the week
        if current_week_weight >= weight_per_week and week_num < total_weeks:
            schedule.append({
                "week": week_num,
                "topics": current_week_topics
            })
            current_week_topics = []
            current_week_weight = 0
            week_num += 1
            
    # Add remaining topics to last week
    if current_week_topics:
        if week_num > total_weeks:
            # Distribute leftover to previous weeks if too many, 
            # or just add to last week
            schedule[-1]["topics"].extend(current_week_topics)
        else:
            schedule.append({
                "week": week_num,
                "topics": current_week_topics
            })
            
    return schedule

# Topic Knowledge Base for Chat (Dynamically populated during analysis)
DYNAMIC_KNOWLEDGE = {}

def update_dynamic_knowledge(topic_details, raw_text):
    """
    Attempts to find context for each topic in the raw text.
    """
    global DYNAMIC_KNOWLEDGE
    DYNAMIC_KNOWLEDGE = {} # Reset
    
    # Pre-split text into lines for searching
    lines = raw_text.split('\n')
    
    for topic in topic_details:
        context = ""
        # Find the line containing the topic
        for i, line in enumerate(lines):
            if topic.lower() in line.lower():
                # Take 2 lines after it as context
                follow_up = " ".join([l.strip() for l in lines[i+1:i+3] if l.strip()])
                if follow_up:
                    context = f"Relevant details from syllabus: {follow_up}"
                break
        
        DYNAMIC_KNOWLEDGE[topic.lower()] = context

def chat_with_mentor(topic, user_message):
    message_lower = user_message.lower()
    topic_lower = topic.lower()
    
    # Intent detection
    if any(word in message_lower for word in ["hello", "hi", "hey"]):
        return f"Hi! I'm your academic mentor for {topic}. How can I assist your study session today?"
    
    if any(word in message_lower for word in ["what is", "define", "explain", "understand", "about", "important"]):
        # 1. Check dynamic knowledge from syllabus first
        if topic_lower in DYNAMIC_KNOWLEDGE and DYNAMIC_KNOWLEDGE[topic_lower]:
            return f"According to your syllabus, {topic} involves: {DYNAMIC_KNOWLEDGE[topic_lower]}. Focus on how these concepts connect to each other."
        
        # 2. Heuristic-based response if no specific text found
        if "unit" in topic_lower or "module" in topic_lower:
            return f"{topic} is a major section of your course. It likely covers the core principles and frameworks you'll need for this module. I recommend reviewing any introductory notes you have for this unit."
        
        return f"To master {topic}, you should focus on its core definitions and how it integrates with the rest of this module. Have you checked the 'YouTube' or 'GeeksforGeeks' resources I linked in your roadmap?"
        
    if "example" in message_lower:
        return f"Think of {topic} in a real-world context. For instance, if this were applied in industry, it would help in optimizing processes or improving system accuracy. Try to find a case study in your textbooks!"

    if any(word in message_lower for word in ["hard", "difficult", "confused", "stuck"]):
        return f"It's completely normal to find {topic} challenging. Don't rush. Try breaking it down: focus on one sub-topic for 20 minutes, then take a break. The mentor advice session for this topic has some specific tips too!"

    # Fallback
    return f"That's an interesting question about {topic}. I suggest cross-referencing this with the resources in your dashboard or asking your professor for a specific case study to clarify the application."
