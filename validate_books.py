import json
import os
import re
import time
import urllib.request
import urllib.parse
import urllib.error
import math
from datetime import datetime

INPUT_FILE = "public/books_data.json"
OUTPUT_FILE = "public/books_data_validated.json"
LOG_FILE = "validation_log.txt"
BATCH_SIZE = 5000  # Increased batch size for broader cleanup
DELAY = 0.5 # Faster processing

# Regex for cleaning artifacts
CLEAN_PATTERNS = [
    r'(z-lib.org)',
    r'(libgen.li)',
    r'(PDFDrive.com)',
    r'(PDFDrive)',
    r'.epub',
    r'.pdf',
    r'.mobi',
    r'.azw3',
    r'[[.*?]]',
    r'(.??\d{4}.*?)'
]

# Regex for detecting garbage titles to DELETE
GARBAGE_PATTERNS = [
    r'^\d{4}\.\d+', # e.g. 2015.342641...
    r'^\d+$', # Pure numbers
    r'^[a-zA-Z0-9]{20,}$', # Long random strings like wzX0Frqn...
    r'^doku.pub',
    r'.jpeg$',
    r'.jpg$',
    r'.png$',
    r'^unknown$',
    r'^slide\d+', # PPT slides
    r'^img_\d+',
    r'^scan',
    r'^untitled'
]

# Genre Popularity Scores
GENRE_SCORES = {
    "Finance & Trading": 100,
    "Computer Science & Data": 100,
    "Business & Leadership": 90,
    "Self-Help & Psychology": 85,
    "History & Geopolitics": 75,
    "Science & Math": 75,
    "Philosophy & Spirituality": 70,
    "Fiction & Literature": 60,
    "General": 50
}

def clean_text(text):
    if not text: return ""
    # Replace underscores with spaces first
    text = text.replace('_', ' ')
    for pattern in CLEAN_PATTERNS:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)
    return text.strip().replace('  ', ' ')

def is_garbage(title):
    if not title or len(title) < 3:
        return True
    for pattern in GARBAGE_PATTERNS:
        if re.search(pattern, title, flags=re.IGNORECASE):
            return True
    return False

def fetch_google_books_metadata(title, author):
    query = f"intitle:{title}"
    if author and author != "Unknown Author" and not is_garbage(author):
        query += f"+inauthor:{author}"
    
    params = urllib.parse.urlencode({'q': query, 'maxResults': 1})
    url = f"https://www.googleapis.com/books/v1/volumes?{params}"
    
    retries = 3
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(url) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode())
                    if "items" in data and len(data["items"]) > 0:
                        return data["items"][0]["volumeInfo"]
                    else:
                        return None
        except Exception as e:
            if "429" in str(e) or "503" in str(e):
                time.sleep(2 * (attempt + 1))
                continue
            else:
                return None
    return None

def calculate_weighted_score(book, metadata):
    ratings_count = metadata.get("ratingsCount", 0) if metadata else 0
    if ratings_count > 0:
        sales_score = min(100, (math.log10(ratings_count + 1) / 4) * 100)
    else:
        sales_score = 0
        
    year = 2000 
    if metadata and "publishedDate" in metadata:
        try:
            year = int(metadata["publishedDate"][:4])
        except:
            pass
    elif book.get("year") and book["year"] != "Unknown":
        try:
            year = int(book["year"])
        except:
            pass
            
    recency_score = max(0, min(100, (year - 1980) / 45 * 100))
    genre = book.get("category", "General")
    genre_score = GENRE_SCORES.get(genre, 50)
    
    final_score = (sales_score * 0.6) + (recency_score * 0.2) + (genre_score * 0.2)
    return int(final_score), ratings_count

def validate_and_enrich():
    # Always load from the main scraped list (or previous validated list if we want to chain)
    # To do a full clean, let's load from the scraped books_data.json but also check if we have better data in validated.
    
    validated_map = {}
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, 'r') as f:
                for b in json.load(f):
                    validated_map[b['filename']] = b # Map by filename to persist validation
        except:
            pass

    try:
        with open(INPUT_FILE, 'r') as f:
            books = json.load(f)
    except FileNotFoundError:
        print("Input file not found.")
        return

    final_books = []
    log_entries = []
    processed_count = 0
    deleted_count = 0
    
    print(f"Starting validation for {len(books)} books (Batch limit: {BATCH_SIZE})...")
    
    for book in books:
        # Pre-cleaning
        original_title = book.get("title", "")
        # If we have a validated version, check if we should keep it or re-validate?
        # Let's keep validated versions but ensure they aren't garbage.
        
        if book['filename'] in validated_map:
            v_book = validated_map[book['filename']]
            # Only keep if not garbage (double check)
            if not is_garbage(v_book['title']):
                final_books.append(v_book)
                continue
        
        # New or unvalidated book
        if processed_count >= BATCH_SIZE:
            # Append remaining books without API check, BUT apply local garbage filter
            clean_t = clean_text(original_title)
            if not is_garbage(clean_t):
                book['title'] = clean_t
                final_books.append(book)
            else:
                deleted_count += 1
            continue

        # Active Processing
        clean_title = clean_text(original_title)
        clean_author = clean_text(book.get("author", ""))
        
        # 1. Immediate Garbage Check
        if is_garbage(clean_title):
            log_entries.append(f"DELETED (Garbage Name): {original_title}")
            deleted_count += 1
            continue
            
        book["title"] = clean_title
        book["author"] = clean_author
        
        # 2. API Validation
        print(f"Validating: {clean_title}")
        metadata = fetch_google_books_metadata(clean_title, clean_author)
        
        if metadata:
            # FOUND! Update with canonical data
            book["title"] = metadata.get("title", clean_title)
            if "authors" in metadata:
                book["author"] = ", ".join(metadata["authors"])
            
            # Enrich fields
            identifiers = metadata.get("industryIdentifiers", [])
            isbn = next((i["identifier"] for i in identifiers if i["type"] in ["ISBN_13", "ISBN_10"]), None)
            if isbn: book["isbn"] = isbn
            if "publisher" in metadata: book["publisher"] = metadata["publisher"]
            if "publishedDate" in metadata: book["year"] = metadata["publishedDate"][:4]
            if "categories" in metadata and metadata["categories"]: book["genre"] = metadata["categories"][0]
            
            image_links = metadata.get("imageLinks", {})
            img = image_links.get("thumbnail") or image_links.get("smallThumbnail")
            if img: book["coverImage"] = img.replace("http://", "https://")
            
            if "description" in metadata:
                book["description"] = metadata["description"]
                if not book.get("review") or book.get("review").startswith("A valuable addition"):
                    book["review"] = metadata["description"][:300] + "..."
            
            # Calculate Score
            score, sales_count = calculate_weighted_score(book, metadata)
            book["importance"] = score
            book["salesCount"] = sales_count
            
            final_books.append(book)
            processed_count += 1
            time.sleep(DELAY)
            
        else:
            # NOT FOUND in API
            log_entries.append(f"DELETED (Not found on Google Books): {clean_title}")
            deleted_count += 1

    # Sort
    final_books.sort(key=lambda x: x.get('importance', 0), reverse=True)

    # Save
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(final_books, f, indent=2)
        
    if log_entries:
        with open(LOG_FILE, 'a') as f:
            f.write("\n".join(log_entries) + "\n")

    print(f"Cleanup complete.")
    print(f"Processed via API: {processed_count}")
    print(f"Deleted Books: {deleted_count}")
    print(f"Total Valid Books: {len(final_books)}")

if __name__ == "__main__":
    validate_and_enrich()