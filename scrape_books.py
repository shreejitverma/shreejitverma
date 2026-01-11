import os
import json
import re
import urllib.parse

# Configuration
DIRECTORIES = [
    {
        "path": "/Users/shreejitverma/Library/CloudStorage/OneDrive-vit.ac.in/Books",
        "link_prefix": "/library",
        "type": "file"
    },
    {
        "path": "/Users/shreejitverma/Library/CloudStorage/OneDrive-vit.ac.in/shreejit_verma.gitlab.io/content/Books",
        "link_prefix": "/content_library",
        "type": "metadata"
    }
]
OUTPUT_FILE = "public/books_data.json"

# Regex patterns
PATTERN_YEAR = re.compile(r'\((\d{4})\)')
PATTERN_EXT = re.compile(r'\.(pdf|epub|mobi|azw3|md)$', re.IGNORECASE)
PATTERN_JUNK = [
    r'\(z-lib\.org\)',
    r'\(libgen\.li\)',
    r'\(PDFDrive\.com\)',
    r'\(PDFDrive\)',
    r'\[.*?\]',
]

CATEGORIES = {
    "Finance & Trading": ["finance", "trading", "investing", "market", "economy", "wealth", "buffett", "dalio", "graham", "stock", "option", "derivative", "risk", "portfolio", "arbitrage", "hedge fund", "crypto", "bitcoin", "blockchain", "quant", "valuation", "venture capital", "bank", "currency", "equity", "asset", "capital", "technical analysis", "fundamental analysis", "forex", "fixed income", "security analysis", "financial engineering"],
    "Computer Science & Data": ["computer", "programming", "python", "java", "c++", "code", "algorithm", "software", "data", "learning", "ai", "neural", "network", "cloud", "distributed", "database", "system", "bash", "linux", "unix", "security", "hacking", "machine learning", "deep learning", "design patterns", "interview", "web", "react", "node", "javascript", "golang", "rust", "computational"],
    "Business & Leadership": ["management", "leadership", "startup", "entrepreneur", "strategy", "marketing", "sales", "branding", "product", "manager", "ceo", "work", "negotiation", "company", "corporate", "mba", "business", "consulting"],
    "Self-Help & Psychology": ["habit", "mind", "psychology", "success", "power", "influence", "thinking", "brain", "emotion", "happiness", "life", "stoic", "discipline", "rules", "focus", "atomic", "subconscious", "growth", "motivation", "improving", "productivity", "cognitive", "behavior"],
    "Philosophy & Spirituality": ["god", "yoga", "karma", "soul", "philosophy", "meditation", "monk", "dharma", "hinduism", "religion", "consciousness", "zen", "buddha", "wisdom", "spiritual", "sutra", "gita", "vedas", "purana", "mahabharata", "ramayana", "bible", "tao"],
    "History & Geopolitics": ["history", "civilization", "world", "sapiens", "war", "politics", "nation", "empire", "china", "india", "geography", "diplomacy", "government", "constitution", "democracy", "russia", "america", "modern", "ancient", "colonialism"],
    "Science & Math": ["physics", "math", "calculus", "algebra", "biology", "science", "universe", "space", "evolution", "chemistry", "engineering", "statistics", "probability", "theorem", "logic", "quantum", "relativity", "genome"],
    "Fiction & Literature": ["novel", "story", "fiction", "potter", "rings", "games", "literature", "classic", "dostoevsky", "kafka", "camus", "tolstoy", "orwell", "shakespeare", "hemingway", "murakami", "stephen king", "george r.r. martin", "hitchhiker", "shades", "girl", "boy", "prince", "thrones"]
}

# Importance Scoring Factors
IMPORTANT_AUTHORS = [
    "taleb", "kahneman", "graham", "dalio", "buffett", "munger", "navimoto", "shreve", "hull", "thiel", 
    "hoffman", "ferriss", "clear", "peterson", "harari", "aurelius", "seneca", "tolstoy", "dostoevsky",
    "feynman", "einstein", "newton", "hawking", "sagan", "goodfellow", "knuth", "cormen", "martin",
    "turing", "shannon", "neumann", "wiener", "lovelace", "hopper", "gates", "jobs", "musk", "bezos",
    "ma", "thiel", "andreessen", "horowitz", "graham", "dodd", "fisher", "soros", "simmons", "griffin",
    "cohen", "schwarzman", "icahn", "tepper", "paulson", "druckenmiller", "jones", "bogle", "marks",
    "lynch", "greenblatt", "shiller", "siegel", "malkiel", "fama", "french", "markowitz", "sharpe",
    "black", "scholes", "merton", "modigliani", "miller", "arrow", "samuelson", "solow", "friedman",
    "krugman", "stiglitz", "acemoglu", "piketty", "sachs", "rodrik", "sen", "banerjee", "duflo",
    "thaler", "shiller", "kahneman", "tversky", "ariely", "thaler", "sunstein", "gladwell", "lewis",
    "dubner", "levitt", "pink", "grant", "sinek", "robbins", "ferriss", "holiday", "mckeown", "newport",
    "clear", "duhigg", "goggins", "willink", "babin", "mcraven", "mattis", "mcchrystal", "powell", "rice",
    "obama", "clinton", "bush", "kissinger", "albright", "brzezinski", "gates", "schmidt", "nadella",
    "pichai", "cook", "ive", "wozniak", "dorsey", "stone", "systrom", "chesky", "gebbia", "blecharczyk",
    "kalanick", "chesky", "camp", "hoffman", "wei", "yuan", "zhang", "ma", "pony", "lei", "cheng",
    "ding", "wang", "zhang", "huang", "zheng", "su", "yang", "liu", "chen", "li", "zhou", "wu", "xu",
    "sun", "guo", "jiang", "he", "lin", "gao", "hu", "zhao", "zhu", "ma", "lu", "tang", "fan", "jin",
    "gu", "deng", "cai", "ye", "tian", "ren", "pan", "yuan", "peng", "luo", "xiao", "cheng", "du",
    "dai", "yao", "zhong", "shen", "song", "xie", "han", "tang", "feng", "yu", "dong", "liang", "tsai"
]

IMPORTANT_KEYWORDS = [
    "handbook", "bible", "definitive", "guide", "introduction", "principles", "analysis", "intelligent",
    "security", "structure", "interpretation", "wealth", "nations", "capital", "thinking", "fast", "slow",
    "black", "swan", "antifragile", "skin", "game", "fooled", "randomness", "bed", "procrustes",
    "meditations", "letters", "republic", "politics", "ethics", "rhetoric", "poetics", "physics",
    "metaphysics", "organon", "nicomachean", "eudemian", "magna", "moralia", "athenian", "constitution",
    "categories", "interpretation", "analytics", "sophistical", "refutations", "topics", "meteorology",
    "universe", "heavens", "generation", "corruption", "soul", "memory", "reminiscence", "sleep",
    "sleeplessness", "dreams", "prophesying", "length", "shortness", "life", "youth", "old", "age",
    "respiration", "breath", "history", "animals", "parts", "movement", "progression", "generation"
]

def clean_junk(text):
    for pattern in PATTERN_JUNK:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)
    return text

def guess_category(title, author, full_path):
    text = (title + " " + author).lower()
    path_lower = full_path.lower()
    
    scores = {cat: 0 for cat in CATEGORIES}
    
    for cat, keywords in CATEGORIES.items():
        if cat.lower().split()[0] in path_lower: # simple folder match
             scores[cat] += 5
        
        for keyword in keywords:
            if f" {keyword} " in f" {text} ": 
                scores[cat] += 2
            elif keyword in text:
                scores[cat] += 1
                
    best_cat = max(scores, key=scores.get)
    if scores[best_cat] > 0:
        return best_cat
    return "General"

def calculate_importance(title, author, category, has_review, has_download):
    score = 0
    text = (title + " " + author).lower()
    
    # 1. Author Fame
    for famous in IMPORTANT_AUTHORS:
        if famous in text:
            score += 30
            break # Cap per author match
            
    # 2. Keywords
    for keyword in IMPORTANT_KEYWORDS:
        if keyword in text:
            score += 10
            
    # 3. Completeness Bonus
    if has_review: score += 15
    if has_download: score += 10
    
    # 4. Category Bias (User's field preference)
    if category == "Finance & Trading": score += 20
    if category == "Computer Science & Data": score += 15
    
    # Cap at 100
    return min(100, score)

def parse_filename(filename):
    name_no_ext = os.path.splitext(filename)[0]
    year_match = PATTERN_YEAR.search(name_no_ext)
    year = year_match.group(1) if year_match else "Unknown"
    
    clean_name = PATTERN_YEAR.sub('', name_no_ext).strip()
    clean_name = clean_junk(clean_name).strip()
    clean_name = re.sub(r'\(.*\)', '', clean_name).strip()
    
    if " by " in clean_name:
        parts = clean_name.split(" by ")
        if len(parts) >= 2:
            return parts[1].strip(), parts[0].strip(), year

    if " - " in clean_name:
        parts = clean_name.split(" - ")
        if len(parts) >= 2:
            p0 = parts[0].strip()
            p1 = parts[1].strip()
            if filename.lower().endswith(".md"):
                return p1, p0, year 
            else:
                return p0, p1, year 
            
    return "Unknown Author", clean_name, year

def get_review_from_md(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            content = re.sub(r'^---\n.*?\n---\n', '', content, flags=re.DOTALL)
            return content[:500].strip() + "..." if len(content) > 500 else content.strip()
    except:
        return ""

books = []

for source in DIRECTORIES:
    for root, dirs, files in os.walk(source["path"]):
        for file in files:
            if not PATTERN_EXT.search(file): continue
            if file.startswith('.'): continue

            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, source["path"])
            ext = file.split('.')[-1].upper()
            
            author, title, year = parse_filename(file)
            author = clean_junk(author).strip().strip(',').strip()
            title = clean_junk(title).strip().strip(',').strip()

            if not title: continue

            category = guess_category(title, author, full_path)
            
            download_link = ""
            review = ""
            
            if source["type"] == "file":
                download_link = f"{source['link_prefix']}/{urllib.parse.quote(rel_path)}"
            elif source["type"] == "metadata":
                review = get_review_from_md(full_path)
            
            existing_index = next((i for i, b in enumerate(books) if b["title"].lower() == title.lower()), -1)
            
            if existing_index > -1:
                if review: books[existing_index]["review"] = review
                if download_link: 
                    books[existing_index]["downloadLink"] = download_link
                    books[existing_index]["format"] = ext
                    books[existing_index]["filename"] = file
                if books[existing_index]["category"] == "General" and category != "General":
                    books[existing_index]["category"] = category
                if books[existing_index]["year"] == "Unknown" and year != "Unknown":
                    books[existing_index]["year"] = year
            else:
                books.append({
                    "title": title,
                    "author": author,
                    "year": year,
                    "category": category,
                    "downloadLink": download_link,
                    "filename": file,
                    "format": ext if source["type"] == "file" else "INFO",
                    "review": review,
                    "importance": 0 # Placeholder
                })

# Calculate Importance for all books
for book in books:
    book["importance"] = calculate_importance(
        book["title"], 
        book["author"], 
        book["category"], 
        bool(book.get("review")),
        bool(book.get("downloadLink"))
    )

# Sort by Importance (Descending)
books.sort(key=lambda x: x['importance'], reverse=True)

with open(OUTPUT_FILE, 'w') as f:
    json.dump(books, f, indent=2)

print(f"Scraped {len(books)} books. Data saved to {OUTPUT_FILE}")
