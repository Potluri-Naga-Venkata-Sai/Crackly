import os
import glob

# The directory containing the API files
api_dir = "/Users/pnvsai/Projects/AI Interviewer/backend/api"
files = glob.glob(os.path.join(api_dir, "*.py"))

old_text = "If it is a person's name (like 'varshith', 'john'), a random word, a gibberish string, or fake, return exactly this JSON:"
new_text = "If it is a person's name (like 'varshith', 'john'), a random non-company word (Note: Apple, Amazon, Target, etc. are valid companies), a gibberish string, or fake, return exactly this JSON:"

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()
    
    if old_text in content:
        content = content.replace(old_text, new_text)
        with open(file_path, "w") as f:
            f.write(content)
        print(f"Updated {file_path}")

print("Done")
