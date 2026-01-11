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
BATCH_SIZE = 5000 
DELAY = 0.5 

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
    r'^untitled',
    r'^lemh\d+',
    r'^\d+-Rajendra',
    r'^\d+(\.\d+)+$'
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
    text = text.replace('_', ' ')
    for pattern in CLEAN_PATTERNS:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)
    return text.strip().replace('  ', ' ')

def is_garbage(title):
    if not title or len(title) < 3:
        return True
    if re.search(r'\bncert\b', title, re.IGNORECASE):
        return True
    for pattern in GARBAGE_PATTERNS:
        if re.search(pattern, title, flags=re.IGNORECASE):
            return True
    if re.match(r'^[a-z0-9]+$', title, re.IGNORECASE):
        if len(title) >= 5:
            if re.search(r'\d', title): return True
            if len(title) > 20: return True
    return False

def check_amazon_cover(isbn):
    # Try ISBN-10 first. If ISBN-13, convert or use as is (Amazon often accepts ISBN-13 in URL)
    # URL: https://images-na.ssl-images-amazon.com/images/P/{isbn}.01.LZZZZZZZ.jpg
    # We verify validity by checking content length or header. 
    # Actually, Amazon returns a 1x1 gif if not found. We should check that.
    
    url = f"https://images-na.ssl-images-amazon.com/images/P/{isbn}.01.LZZZZZZZ.jpg"
    try:
        req = urllib.request.Request(url, method='HEAD')
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                # Need to check content length or fetch small part to ensure it's not the 1x1 error image.
                # The 1x1 gif is very small (< 100 bytes). Real covers are > 2KB usually.
                length = response.getheader('Content-Length')
                if length and int(length) > 100:
                    return url
    except:
        pass
    return None

def generate_summary(description):
    if not description: return ""
    # Split by sentences (simple heuristic)
    sentences = re.split(r'(?<=[.!?]) +', description)
    summary = " ".join(sentences[:3])
    if len(summary) > 500:
        summary = summary[:497] + "..."
    return summary

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
        try: year = int(metadata["publishedDate"][:4])
        except: pass
    elif book.get("year") and book["year"] != "Unknown":
        try: year = int(book["year"])
        except: pass
    recency_score = max(0, min(100, (year - 1980) / 45 * 100))
    genre = book.get("category", "General")
    genre_score = GENRE_SCORES.get(genre, 50)
    final_score = (sales_score * 0.6) + (recency_score * 0.2) + (genre_score * 0.2)
    return int(final_score), ratings_count

def validate_and_enrich():
    validated_map = {}
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, 'r') as f:
                for b in json.load(f):
                    validated_map[b['filename']] = b
        except: pass

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
    
    print(f"Starting validation for {len(books)} books...")
    
    for book in books:
        original_title = book.get("title", "")
        clean_title_val = clean_text(original_title)
        
        # Immediate Garbage Check
        if is_garbage(clean_title_val):
            log_entries.append(f"DELETED (Garbage): {original_title}")
            deleted_count += 1
            continue

        book_to_process = book
        needs_enrichment = True
        
        # Check if we have a validated version
        if book['filename'] in validated_map:
            v_book = validated_map[book['filename']]
            # Use validated version, but check if it needs update
            # Needs update if: No Cover OR No Description OR Description is "A valuable addition..."
            has_cover = bool(v_book.get('coverImage'))
            has_good_review = bool(v_book.get('review') and not v_book.get('review').startswith("A valuable addition"))
            
            if has_cover and has_good_review:
                final_books.append(v_book)
                needs_enrichment = False
            else:
                book_to_process = v_book # Start with what we have
                needs_enrichment = True
        
        if not needs_enrichment:
            continue
            
        if processed_count >= BATCH_SIZE:
             # Just keep what we have if we hit limit (prevents total loss)
             final_books.append(book_to_process)
             continue

        # Enrich
        print(f"Enriching: {clean_title_val}")
        metadata = fetch_google_books_metadata(clean_title_val, clean_text(book.get("author", "")))
        
        if metadata:
            book_to_process["title"] = metadata.get("title", clean_title_val)
            if "authors" in metadata:
                book_to_process["author"] = ", ".join(metadata["authors"])
            
            isbn = None
            identifiers = metadata.get("industryIdentifiers", [])
            # Try to get ISBN-10 first for Amazon
            isbn_10 = next((i["identifier"] for i in identifiers if i["type"] == "ISBN_10"), None)
            isbn_13 = next((i["identifier"] for i in identifiers if i["type"] == "ISBN_13"), None)
            
            if isbn_10: isbn = isbn_10
            elif isbn_13: isbn = isbn_13
            
            if isbn: book_to_process["isbn"] = isbn
            if "publisher" in metadata: book_to_process["publisher"] = metadata["publisher"]
            if "publishedDate" in metadata: book_to_process["year"] = metadata["publishedDate"][:4]
            if "categories" in metadata and metadata["categories"]: book_to_process["genre"] = metadata["categories"][0]
            
            # Cover Logic: Amazon > Google
            cover_url = None
            if isbn:
                cover_url = check_amazon_cover(isbn)
            
            if not cover_url:
                image_links = metadata.get("imageLinks", {})
                img = image_links.get("thumbnail") or image_links.get("smallThumbnail")
                if img: cover_url = img.replace("http://", "https://")
            
            if cover_url:
                book_to_process["coverImage"] = cover_url
                
            # Description/Review Logic
            description = metadata.get("description", "")
            if description:
                book_to_process["description"] = description
                book_to_process["review"] = generate_summary(description)
            
            score, sales_count = calculate_weighted_score(book_to_process, metadata)
            book_to_process["importance"] = score
            book_to_process["salesCount"] = sales_count
            
            final_books.append(book_to_process)
            processed_count += 1
            time.sleep(DELAY)
            
        else:
             # Not found in API. Delete.
             log_entries.append(f"DELETED (Not found): {clean_title_val}")
             deleted_count += 1

    final_books.sort(key=lambda x: x.get('importance', 0), reverse=True)

    with open(OUTPUT_FILE, 'w') as f:
        json.dump(final_books, f, indent=2)
        
    if log_entries:
        with open(LOG_FILE, 'a') as f:
            f.write("\n".join(log_entries) + "\n")

    print(f"Cleanup complete.")
    print(f"Processed/Enriched: {processed_count}")
    print(f"Deleted Books: {deleted_count}")
    print(f"Total Valid Books: {len(final_books)}")

if __name__ == "__main__":
    validate_and_enrich()
