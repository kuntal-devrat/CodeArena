"""
Bulk Ingestion Script for CodeArena.
Downloads the complete verified LeetCode problems dataset (2,900+ questions)
and bulk-inserts all questions directly into the database.
"""

import sys
import os
import re
import json
import sqlite3
import time
import urllib.request
from datetime import datetime

DATA_URL = "https://raw.githubusercontent.com/neenza/leetcode-problems/master/merged_problems.json"
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
LOCAL_DATA_FILE = os.path.join(DATA_DIR, "merged_problems.json")
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../apps/api/prisma/dev.db"))

def download_dataset():
    """Download merged_problems.json if not already cached."""
    os.makedirs(DATA_DIR, exist_ok=True)
    if os.path.exists(LOCAL_DATA_FILE) and os.path.getsize(LOCAL_DATA_FILE) > 10 * 1024 * 1024:
        print(f"[CACHE] Using existing dataset at {LOCAL_DATA_FILE} ({round(os.path.getsize(LOCAL_DATA_FILE)/(1024*1024), 2)} MB)")
        return

    print(f"[DOWNLOAD] Downloading complete LeetCode dataset (~19 MB) from {DATA_URL} ...")
    start = time.time()
    req = urllib.request.Request(DATA_URL, headers={"User-Agent": "Mozilla/5.0"})
    
    with urllib.request.urlopen(req) as response, open(LOCAL_DATA_FILE, "wb") as out_file:
        total_size = int(response.info().get("Content-Length", 0))
        downloaded = 0
        chunk_size = 1024 * 512 # 512KB chunks

        while True:
            chunk = response.read(chunk_size)
            if not chunk:
                break
            out_file.write(chunk)
            downloaded += len(chunk)
            if total_size > 0:
                percent = (downloaded / total_size) * 100
                print(f"\rDownloading: {round(downloaded / (1024*1024), 1)} MB / {round(total_size / (1024*1024), 1)} MB ({percent:.1f}%)", end="", flush=True)
            else:
                print(f"\rDownloading: {round(downloaded / (1024*1024), 1)} MB", end="", flush=True)

    print(f"\n[DOWNLOAD COMPLETE] Finished in {time.time() - start:.2f}s.")

def parse_example_text(text: str) -> dict:
    """Parse input, output, and explanation from example text."""
    input_m = re.search(r'Input:\s*([^\n\r]+)', text)
    output_m = re.search(r'Output:\s*([^\n\r]+)', text)
    exp_m = re.search(r'Explanation:\s*([\s\S]+)', text)

    return {
        "input": input_m.group(1).strip() if input_m else text.strip(),
        "output": output_m.group(1).strip() if output_m else "",
        "explanation": exp_m.group(1).strip() if exp_m else ""
    }

def map_starter_code(snippets: dict) -> dict:
    """Normalize language keys for CodeArena."""
    if not isinstance(snippets, dict):
        return {}
    
    mapping = {
        "python3": "python",
        "python": "python",
        "javascript": "javascript",
        "typescript": "typescript",
        "cpp": "cpp",
        "java": "java",
        "golang": "go",
        "rust": "rust",
    }
    
    res = {}
    for lang, code in snippets.items():
        lang_lower = lang.lower()
        if lang_lower in mapping:
            target = mapping[lang_lower]
            if target == "python" and "python" in res and lang_lower == "python":
                continue # Prefer python3
            res[target] = code
    return res

def bulk_insert_problems():
    """Load JSON and insert into SQLite database."""
    download_dataset()

    print(f"[INGEST] Reading dataset from {LOCAL_DATA_FILE} ...")
    with open(LOCAL_DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    questions = data.get("questions", [])
    total_questions = len(questions)
    print(f"[INGEST] Loaded {total_questions} problems from dataset. Beginning database insert into {DB_PATH} ...")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Ensure table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='Problem'")
    if not cursor.fetchone():
        print(f"[ERROR] Problem table not found in {DB_PATH}. Run 'npx prisma db push' first.")
        conn.close()
        sys.exit(1)

    now_iso = datetime.utcnow().isoformat() + "Z"
    batch = []
    inserted_count = 0

    for idx, q in enumerate(questions):
        slug = q.get("problem_slug") or f"problem-{idx}"
        title = q.get("title") or slug.replace("-", " ").title()
        qid = q.get("frontend_id") or str(idx + 1)
        db_id = f"c_{qid.zfill(5)}_{slug}"

        diff_raw = (q.get("difficulty") or "Medium").upper()
        difficulty = "EASY" if "EASY" in diff_raw else ("HARD" if "HARD" in diff_raw else "MEDIUM")
        tags_json = json.dumps(q.get("topics") or [])
        desc = q.get("description") or f"<p>{title}</p>"

        # Parse examples
        parsed_examples = []
        raw_examples = q.get("examples") or []
        for ex in raw_examples:
            if isinstance(ex, dict) and "example_text" in ex:
                parsed_examples.append(parse_example_text(ex["example_text"]))
            elif isinstance(ex, str):
                parsed_examples.append(parse_example_text(ex))
        examples_json = json.dumps(parsed_examples)

        # Constraints
        constraints_json = json.dumps(q.get("constraints") or [])

        # Starter code
        starter_code = map_starter_code(q.get("code_snippets") or {})
        starter_code_json = json.dumps(starter_code)

        # Test cases
        test_cases = []
        for ex in parsed_examples:
            if ex.get("input") and ex.get("output"):
                test_cases.append({
                    "input": ex["input"],
                    "expected": ex["output"]
                })
        test_cases_json = json.dumps(test_cases)

        batch.append((
            db_id,
            slug,
            title,
            difficulty,
            tags_json,
            desc,
            examples_json,
            constraints_json,
            starter_code_json,
            test_cases_json,
            now_iso
        ))

    # Bulk insert with INSERT OR REPLACE
    start_insert = time.time()
    cursor.executemany("""
        INSERT OR REPLACE INTO Problem (
            id, slug, title, difficulty, tags, description,
            examples, constraints, starterCode, testCases, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, batch)

    conn.commit()

    # Query total count
    cursor.execute("SELECT COUNT(*) FROM Problem")
    total_db = cursor.fetchone()[0]
    conn.close()

    elapsed = time.time() - start_insert
    print(f"\n[SUCCESS] Bulk ingestion complete!")
    print(f"Total problems inserted/updated: {len(batch)}")
    print(f"Total problems currently stored in DB: {total_db}")
    print(f"Database insertion took: {elapsed:.2f} seconds.")

if __name__ == "__main__":
    bulk_insert_problems()
