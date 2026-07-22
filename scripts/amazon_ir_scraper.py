import os
import requests
import re
import time
from urllib.parse import urljoin
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

# Base save directory on your Mac
base_dir = os.path.expanduser("~/Downloads/Amazon_IR_Documents")

url = "https://ir.aboutamazon.com/annual-reports-proxies-and-shareholder-letters/default.aspx"
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def get_folder_name(doc_name):
    doc_name_lower = doc_name.lower()
    if 'annual report' in doc_name_lower:
        return 'Annual_Reports'
    elif 'proxy' in doc_name_lower:
        return 'Proxy_Statements'
    elif 'letter' in doc_name_lower:
        return 'Shareholder_Letters'
    return 'Other_Documents'

def run():
    print("Starting automated browser to expand all years...")
    
    with sync_playwright() as p:
        # headless=False lets you watch the browser do the clicking!
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(url)
        
        # Wait for the initial page to fully load
        page.wait_for_load_state("networkidle")
        
        # 2026 is already expanded. We click backwards from 2025 down to 1998.
        for year in range(2025, 1997, -1):
            try:
                # Find the element containing exactly the year text and click it
                year_tab = page.get_by_text(str(year), exact=True)
                if year_tab.count() > 0:
                    year_tab.first.click()
                    time.sleep(0.3)  # Brief pause to allow the dropdown animation to finish
            except Exception as e:
                print(f"Could not expand year {year}: {e}")
                
        print("All years expanded! Extracting document links...")
        
        # Grab the fully populated HTML now that all menus are open
        html_content = page.content()
        browser.close()

    # Parse the loaded HTML
    soup = BeautifulSoup(html_content, 'html.parser')
    links = soup.find_all('a', href=True)

    print(f"Saving documents to: {base_dir}\n")

    # Download and organize loop
    for link in links:
        href = link['href']
        text = link.get_text(strip=True)
        
        # Identify relevant documents
        is_relevant_doc = (
            '.pdf' in href.lower() or 
            'annual report' in text.lower() or 
            'proxy statement' in text.lower() or 
            'letter to shareholders' in text.lower()
        )
        
        if text and is_relevant_doc:
            full_url = urljoin(url, href)
            
            # Clean up filename
            clean_name = re.sub(r'\(opens in new window\)', '', text, flags=re.IGNORECASE).strip()
            clean_name = re.sub(r'[^\w\s-]', '', clean_name)
            filename = clean_name.replace(' ', '_') + ".pdf"
            
            # Categorize into folders
            folder_category = get_folder_name(text)
            save_dir = os.path.join(base_dir, folder_category)
            os.makedirs(save_dir, exist_ok=True)
            
            filepath = os.path.join(save_dir, filename)
            
            # Stream the download
            if not os.path.exists(filepath):
                print(f"Downloading into {folder_category}/: {filename}...")
                temp_filepath = filepath + ".part"
                try:
                    doc_response = requests.get(full_url, headers=headers, stream=True, timeout=(10, 60))
                    doc_response.raise_for_status()

                    with open(temp_filepath, 'wb') as f:
                        for chunk in doc_response.iter_content(chunk_size=8192):
                            f.write(chunk)
                    os.replace(temp_filepath, filepath)
                except Exception as e:
                    print(f"  -> Failed to download: {e}")
                    if os.path.exists(temp_filepath):
                        os.remove(temp_filepath)
            else:
                pass # Silently skip duplicates to keep the terminal clean

if __name__ == '__main__':
    run()
    print("\nAll done! Every historical document has been organized in your Downloads folder.")
