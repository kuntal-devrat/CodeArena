import sqlite3
import pandas as pd
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "apps", "api", "prisma", "dev.db")

print(f"Connecting to database at {DB_PATH}...")
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute("SELECT COUNT(*) FROM Problem")
total_in_db = cursor.fetchone()[0]
print(f"Total problems currently in database: {total_in_db}")

splits = [
    "https://huggingface.co/datasets/newfacade/LeetCodeDataset/resolve/refs%2Fconvert%2Fparquet/default/train/0000.parquet",
    "https://huggingface.co/datasets/newfacade/LeetCodeDataset/resolve/refs%2Fconvert%2Fparquet/default/test/0000.parquet"
]

total_updated = 0
for url in splits:
    print(f"\nFetching dataset from {url}...")
    df = pd.read_parquet(url, columns=["task_id", "input_output"])
    print(f"Loaded {len(df)} rows from split.")

    for _, row in df.iterrows():
        slug = str(row["task_id"]).strip()
        raw_io = row["input_output"]

        cases = []
        if hasattr(raw_io, "__iter__"):
            for item in raw_io:
                inp = ""
                out = ""
                if isinstance(item, dict):
                    inp = str(item.get("input", "")).strip()
                    out = str(item.get("output", "")).strip()
                if inp:
                    # Clean up Python None -> null or keep as output
                    if out.lower() == "none":
                        out = "null"
                    cases.append({"input": inp, "expected": out})

        if cases:
            cases_json = json.dumps(cases)
            cursor.execute(
                "UPDATE Problem SET testCases = ? WHERE slug = ?",
                (cases_json, slug)
            )
            if cursor.rowcount > 0:
                total_updated += 1

    conn.commit()
    print(f"Committed batch. Total problems updated with real testcases so far: {total_updated}")

conn.close()
print(f"\n[DONE] Successfully updated {total_updated} problems with authentic real LeetCode test cases!")
