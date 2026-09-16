import sqlite3
import json

conn = sqlite3.connect('apps/api/prisma/dev.db')
cursor = conn.cursor()

# Check total and empty fields
cursor.execute('SELECT COUNT(*) FROM Problem')
total = cursor.fetchone()[0]

cursor.execute('SELECT COUNT(*) FROM Problem WHERE starterCode IS NULL OR starterCode = "" OR starterCode = "{}"')
empty_starter = cursor.fetchone()[0]

cursor.execute('SELECT COUNT(*) FROM Problem WHERE examples IS NULL OR examples = "" OR examples = "[]"')
empty_examples = cursor.fetchone()[0]

cursor.execute('SELECT COUNT(*) FROM Problem WHERE constraints IS NULL OR constraints = "" OR constraints = "[]"')
empty_constraints = cursor.fetchone()[0]

print(f"Total: {total}")
print(f"Empty starter code: {empty_starter}")
print(f"Empty examples: {empty_examples}")
print(f"Empty constraints: {empty_constraints}")

# Let's check some problems with odd descriptions
cursor.execute("SELECT slug, title, description, examples, constraints FROM Problem LIMIT 10")
for r in cursor.fetchall():
    print("--------------------------------------------------")
    print(f"Slug: {r[0]}, Title: {r[1]}")
    desc = r[2] or ""
    print(f"Desc snippet: {repr(desc[:200])}")
    print(f"Desc has dangling Example/Constraints: {'Example 1:' in desc or 'Constraints:' in desc}")
    ex = r[3] or ""
    print(f"Examples snippet: {repr(ex[:120])}")
    cn = r[4] or ""
    print(f"Constraints snippet: {repr(cn[:120])}")

# Check if any titles have HTML or weird characters
cursor.execute("SELECT slug, title FROM Problem WHERE title LIKE '%<%' OR title LIKE '%\xa0%'")
weird_titles = cursor.fetchall()
print(f"Weird titles count: {len(weird_titles)}")
for wt in weird_titles[:5]:
    print('  ', wt)

# Check if any tags are not valid JSON
cursor.execute("SELECT slug, tags FROM Problem")
invalid_tags = 0
for r in cursor.fetchall():
    try:
        json.loads(r[1])
    except:
        invalid_tags += 1
print(f"Invalid tags count: {invalid_tags}")
