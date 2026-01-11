import json
import re

FILE = "public/books_data_validated.json"

def clean_title_logic(title):
    # Remove " by Author" pattern from title if present
    # Case insensitive
    title = re.sub(r'\s+by\s+.*$', '', title, flags=re.IGNORECASE)
    return title.strip().lower()

def clean_key(text):
    return text.strip().lower()

try:
    with open(FILE, 'r') as f:
        books = json.load(f)
except FileNotFoundError:
    print("File not found.")
    exit(1)

unique_books = {}
duplicates_count = 0

print(f"Scanning {len(books)} books for duplicates...")

for book in books:
    original_title = book.get('title', '')
    # Aggressive cleaning for matching
    # 1. Remove " by Author"
    # 2. Lowercase
    title_match_key = clean_title_logic(original_title)
    
    # We use Title as the primary key for de-duplication because 
    # Author might be "Unknown" in one and "Barack Obama" in another.
    # Collision risk: Two different books with exact same title. 
    # Mitigation: This is rare in a personal library compared to duplicates. 
    # If needed we can check author similarity, but let's trust title for now given the specific "Title by Author" issue.
    
    key = title_match_key
    
    if not key: continue 

    if key in unique_books:
        duplicates_count += 1
        existing = unique_books[key]
        
        # Merge Logic - prioritize the "better" data
        
        # 1. Title Quality: Prefer shorter title if the other has "by Author"
        # The existing one in the map came first. 
        # If 'original_title' is shorter/cleaner than 'existing.title', swap?
        # Actually, we should pick the title that DOESNT have "by ...".
        if " by " in existing.get('title', '').lower() and " by " not in original_title.lower():
            existing['title'] = original_title
        
        # 2. Author: Prefer specific over "Unknown"
        if existing.get('author') == "Unknown Author" and book.get('author') != "Unknown Author":
            existing['author'] = book['author']
            
        # 3. Download Link (Crucial)
        if book.get('downloadLink') and not existing.get('downloadLink'):
            existing['downloadLink'] = book['downloadLink']
            existing['format'] = book.get('format', existing.get('format'))
            existing['filename'] = book.get('filename', existing.get('filename'))
            
        # 4. Review (Prefer custom/scraped over generic)
        ex_review = existing.get('review', '')
        new_review = book.get('review', '')
        is_generic = lambda r: not r or r.startswith("A valuable addition")
        
        if is_generic(ex_review) and not is_generic(new_review):
            existing['review'] = new_review
            
        # 5. Metadata fields
        for field in ['isbn', 'publisher', 'genre', 'year', 'coverImage', 'description']:
            if book.get(field) and not existing.get(field):
                existing[field] = book[field]
                
        # 6. Scores (Keep max)
        if book.get('importance', 0) > existing.get('importance', 0):
            existing['importance'] = book['importance']
        if book.get('salesCount', 0) > existing.get('salesCount', 0):
            existing['salesCount'] = book['salesCount']
            
        # 7. Category (Prefer specific over General)
        if existing.get('category') == 'General' and book.get('category') != 'General':
            existing['category'] = book['category']

    else:
        # First time seeing this title
        # Ensure we cleanup the title stored if it has "by Author"
        # Actually, let's keep the original unless we find a better one, 
        # OR we can proactively clean it here.
        # Let's proactively clean the stored title if it looks like "Title by Author"
        
        if " by " in original_title and len(original_title.split(" by ")) > 1:
             # Check if the part after "by" looks like the author
             parts = original_title.split(" by ")
             potential_author = parts[1].strip()
             potential_title = parts[0].strip()
             
             # If current author is Unknown or matches, update it
             if book.get('author') == "Unknown Author" or book.get('author').lower() == potential_author.lower():
                 book['author'] = potential_author
                 book['title'] = potential_title
        
        unique_books[key] = book

# Convert back to list
cleaned_list = list(unique_books.values())

# Sort by Importance
cleaned_list.sort(key=lambda x: x.get('importance', 0), reverse=True)

with open(FILE, 'w') as f:
    json.dump(cleaned_list, f, indent=2)

print(f"Removed {duplicates_count} duplicates.")
print(f"Total unique books: {len(cleaned_list)}")
