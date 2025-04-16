import os
import requests
import time

# List of image URLs (extracted manually)
image_urls = [
]

# Folder where images will be saved (the same folder as this script)
save_folder = os.path.dirname(os.path.abspath(__file__))

def extract_filename(url):
    # Split the URL by '/' and find the segment that ends with '.png'
    for segment in url.split("/"):
        if segment.lower().endswith(".png"):
            return segment
    # Fallback: if no segment is found, use the tail of the URL (after '?' removed)
    return url.split("/")[-1].split("?")[0]

def download_image(url):
    filename = extract_filename(url)
    save_path = os.path.join(save_folder, filename)
    
    print(f"Downloading {url} -> {save_path}")
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an error on bad status codes
        with open(save_path, "wb") as f:
            f.write(response.content)
        print(f"Successfully saved {filename}")
    except Exception as e:
        print(f"Error downloading {url}: {e}")

def main():
    for url in image_urls:
        download_image(url)
        # Wait 1 second between requests to slow down access to the server.
        time.sleep(1)

if __name__ == "__main__":
    main()