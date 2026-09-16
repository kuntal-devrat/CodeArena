import sqlite3
import json
import re

db_path = 'apps/api/prisma/dev.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute('SELECT id, slug, title, description, examples, constraints, starterCode FROM Problem')
rows = cursor.fetchall()
print(f"Total problems to process: {len(rows)}")

updated_count = 0

def clean_desc(desc):
    if not desc:
        return ""
    cleaned = desc.replace('\xa0', ' ').replace('&nbsp;', ' ')
    # Remove dangling empty example headers and constraints
    for _ in range(5):
        cleaned = re.sub(r'(\n|\A)\s*Example\s*\d+\s*:\s*(?=(\n|\Z|Example\s*\d+\s*:|Constraints\s*:))', r'\1', cleaned)
        cleaned = re.sub(r'(\n|\A)\s*Constraints\s*:\s*(?=(\n|\Z|Follow[- ]?up:))', r'\1', cleaned)
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned).strip()
    return cleaned

def clean_json_str(val):
    if not val:
        return val
    return val.replace('\\u00a0', ' ').replace('\xa0', ' ')

def get_default_starter_code(title, slug):
    py_code = "# " + title + "\nclass Solution:\n    def solve(self):\n        # Write your code here\n        pass\n"
    js_code = "// " + title + "\n/**\n * @return {any}\n */\nvar solve = function() {\n    // Write your code here\n};\n"
    ts_code = "// " + title + "\nfunction solve(): any {\n    // Write your code here\n};\n"
    cpp_code = "// " + title + "\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        // Write your code here\n    }\n};\n"
    java_code = "// " + title + "\nimport java.util.*;\n\nclass Solution {\n    public void solve() {\n        // Write your code here\n    }\n}\n"
    return json.dumps({
        "python": py_code,
        "javascript": js_code,
        "typescript": ts_code,
        "cpp": cpp_code,
        "java": java_code
    })


for row in rows:
    p_id, slug, title, desc, examples, constraints, starter = row
    
    new_desc = clean_desc(desc)
    new_examples = clean_json_str(examples)
    new_constraints = clean_json_str(constraints)
    
    new_starter = starter
    if not starter or starter.strip() in ("", "{}", "null"):
        new_starter = get_default_starter_code(title, slug)
        
    if new_desc != desc or new_examples != examples or new_constraints != constraints or new_starter != starter:
        cursor.execute(
            'UPDATE Problem SET description = ?, examples = ?, constraints = ?, starterCode = ? WHERE id = ?',
            (new_desc, new_examples, new_constraints, new_starter, p_id)
        )
        updated_count += 1

conn.commit()
print(f"Successfully cleaned and updated {updated_count} problems in the database!")

# Verify after update
cursor.execute('SELECT COUNT(*) FROM Problem WHERE starterCode IS NULL OR starterCode = "" OR starterCode = "{}"')
print("Empty starter code remaining:", cursor.fetchone()[0])

cursor.execute('SELECT slug, description FROM Problem LIMIT 3 OFFSET 1')
for r in cursor.fetchall():
    print(f"SLUG: {r[0]}")
    print("DESC:", repr(r[1]))

conn.close()
