import re
import json
import ast

def parse_input(raw):
    raw = raw.strip()
    if not raw: return []
    # If comma-separated or newline-separated variable assignments
    if '=' in raw and not (raw.startswith('{') and raw.endswith('}')):
        parts = re.split(r',\s*(?=[a-zA-Z_]\w*\s*=)|\n+', raw)
        args = []
        for p in parts:
            p = p.strip()
            if '=' in p:
                p = p.split('=', 1)[1].strip()
            try:
                args.append(json.loads(p))
            except Exception:
                try:
                    args.append(ast.literal_eval(p))
                except Exception:
                    args.append(p)
        return args
    else:
        lines = [l.strip() for l in raw.split('\n') if l.strip()]
        args = []
        for line in lines:
            if '=' in line and not (line.startswith('{') and line.endswith('}')):
                line = line.split('=', 1)[1].strip()
            try:
                args.append(json.loads(line))
            except Exception:
                try:
                    args.append(ast.literal_eval(line))
                except Exception:
                    args.append(line)
        return args

print("Two Sum:", parse_input("nums = [2,7,11,15], target = 9"))
print("Two Sum multiline:", parse_input("[2,7,11,15]\n9"))
print("String:", parse_input('s = "abcabcbb"'))
print("Valid Parentheses:", parse_input('s = "()"'))
