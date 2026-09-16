"""
LeetCode Problem Scraper for CodeArena.
Uses the `leetscrape` library with GraphQL enrichment for multi-language code snippets,
rich examples, constraints, and judge testcases.
"""

import sys
import os
import re
import json
import argparse
from typing import Dict, Any, List, Optional
import urllib.request
import urllib.error

# Try importing leetscrape
try:
    from leetscrape import GetQuestion
    LEETSCRAPE_AVAILABLE = True
except Exception as e:
    LEETSCRAPE_AVAILABLE = False


LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"
HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://leetcode.com"
}

POPULAR_PROBLEMS = [
    "two-sum",
    "valid-parentheses",
    "longest-substring-without-repeating-characters",
    "reverse-linked-list",
    "container-with-most-water",
    "3sum",
    "climbing-stairs",
    "merge-two-sorted-lists",
    "best-time-to-buy-and-sell-stock",
    "valid-anagram",
    "maximum-subarray",
    "invert-binary-tree",
    "trapping-rain-water"
]

def extract_slug(input_val: str) -> str:
    """Extract slug from a URL or raw slug string."""
    input_val = input_val.strip()
    # Match URL like https://leetcode.com/problems/two-sum/
    match = re.search(r'leetcode\.com/problems/([^/?#]+)', input_val)
    if match:
        return match.group(1).lower()
    # If it's a URL-like string or path
    slug = input_val.strip("/").split("/")[-1].lower()
    return slug

def query_leetcode_graphql(query: str, variables: Dict[str, Any]) -> Dict[str, Any]:
    """Query LeetCode GraphQL API."""
    data = json.dumps({"query": query, "variables": variables}).encode("utf-8")
    req = urllib.request.Request(LEETCODE_GRAPHQL_URL, data=data, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"LeetCode API error {e.code}: {e.reason}")
    except Exception as e:
        raise RuntimeError(f"Failed to fetch from LeetCode GraphQL: {str(e)}")

def parse_html_content(html: str) -> Dict[str, Any]:
    """Parse description HTML into examples, constraints, and clean description."""
    try:
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, "html.parser")
    except ImportError:
        soup = None

    examples = []
    constraints = []

    if soup:
        # Extract examples
        # Typically formatted as <pre> or paragraphs with strong Example
        pre_tags = soup.find_all("pre")
        for pre in pre_tags:
            text = pre.get_text()
            input_m = re.search(r'Input:\s*([^\n\r]+)', text)
            output_m = re.search(r'Output:\s*([^\n\r]+)', text)
            exp_m = re.search(r'Explanation:\s*([\s\S]+)', text)

            if input_m and output_m:
                ex = {
                    "input": input_m.group(1).strip(),
                    "output": output_m.group(1).strip(),
                }
                if exp_m:
                    ex["explanation"] = exp_m.group(1).strip()
                examples.append(ex)

        # Extract constraints
        constraints_header = soup.find(lambda tag: tag.name in ["p", "strong"] and "Constraints:" in tag.get_text())
        if constraints_header:
            ul = constraints_header.find_next("ul")
            if ul:
                for li in ul.find_all("li"):
                    c_text = li.get_text().strip()
                    # Clean up special non-breaking spaces or bullet points
                    c_text = c_text.replace("\xa0", " ").strip("• \t")
                    if c_text:
                        constraints.append(c_text)

    # Fallback regex parsing if soup didn't find them
    if not examples:
        example_blocks = re.findall(r'<strong>Input:</strong>\s*(.*?)\s*<strong>Output:</strong>\s*(.*?)(?:<strong>Explanation:</strong>\s*(.*?))?</pre>', html, re.DOTALL)
        for eb in example_blocks:
            clean_in = re.sub(r'<[^>]+>', '', eb[0]).strip()
            clean_out = re.sub(r'<[^>]+>', '', eb[1]).strip()
            ex = {"input": clean_in, "output": clean_out}
            if len(eb) > 2 and eb[2]:
                ex["explanation"] = re.sub(r'<[^>]+>', '', eb[2]).strip()
            examples.append(ex)

    if not constraints:
        c_block = re.search(r'<p><strong>Constraints:</strong></p>\s*<ul>(.*?)</ul>', html, re.DOTALL)
        if c_block:
            lis = re.findall(r'<li>(.*?)</li>', c_block.group(1), re.DOTALL)
            for li in lis:
                constraints.append(re.sub(r'<[^>]+>', '', li).replace("&lt;", "<").replace("&gt;", ">").replace("&le;", "<=").replace("&ge;", ">=").strip())

    # Sanitize html description: clean non-breaking spaces and dangling empty headers
    clean_html = html.replace("\xa0", " ").replace("&nbsp;", " ")
    for _ in range(5):
        clean_html = re.sub(r'(\n|\A)\s*Example\s*\d+\s*:\s*(?=(\n|\Z|Example\s*\d+\s*:|Constraints\s*:))', r'\1', clean_html)
        clean_html = re.sub(r'(\n|\A)\s*Constraints\s*:\s*(?=(\n|\Z|Follow[- ]?up:))', r'\1', clean_html)
    clean_html = re.sub(r'\n{3,}', '\n\n', clean_html).strip()

    return {
        "examples": examples,
        "constraints": constraints,
        "clean_html": clean_html
    }


def map_code_snippets(snippets: List[Dict[str, str]]) -> Dict[str, str]:
    """Map LeetCode language slugs to CodeArena languages."""
    lang_map = {
        "python3": "python",
        "python": "python",
        "javascript": "javascript",
        "typescript": "typescript",
        "cpp": "cpp",
        "java": "java",
        "golang": "go",
        "rust": "rust",
    }
    starter_code = {}
    for s in snippets:
        slug = s.get("langSlug", "")
        code = s.get("code", "")
        if slug in lang_map:
            target_lang = lang_map[slug]
            # Prioritize python3 over python2
            if target_lang == "python" and slug == "python" and "python" in starter_code:
                continue
            starter_code[target_lang] = code
    return starter_code

def fetch_problem(slug_or_url: str) -> Dict[str, Any]:
    """
    Fetch and normalize problem data from LeetCode.
    Uses `leetscrape.GetQuestion` when available, supplemented with GraphQL for multi-language snippets and testcases.
    """
    slug = extract_slug(slug_or_url)
    if not slug:
        raise ValueError("Invalid problem slug or URL provided.")

    # 1. Fetch detailed question info via GraphQL
    query = """
    query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
            questionId
            questionFrontendId
            title
            titleSlug
            content
            difficulty
            isPaidOnly
            topicTags {
                name
                slug
            }
            codeSnippets {
                lang
                langSlug
                code
            }
            hints
            exampleTestcaseList
        }
    }
    """
    graphql_res = query_leetcode_graphql(query, {"titleSlug": slug})
    q_data = graphql_res.get("data", {}).get("question")
    if not q_data:
        raise ValueError(f"LeetCode problem '{slug}' not found.")

    if q_data.get("isPaidOnly"):
        raise ValueError(f"LeetCode problem '{slug}' is for Premium subscribers only.")

    # 2. If leetscrape is available, also leverage it to ensure parity
    leetscrape_data = None
    if LEETSCRAPE_AVAILABLE:
        try:
            lq = GetQuestion(titleSlug=slug)
            leetscrape_data = lq.scrape()
        except Exception:
            # Fallback gracefully to GraphQL result
            pass

    # Extract fields
    title = q_data.get("title") or (leetscrape_data.title if leetscrape_data else slug.replace("-", " ").title())
    difficulty_raw = (q_data.get("difficulty") or "Easy").upper()
    difficulty = "EASY" if difficulty_raw == "EASY" else ("MEDIUM" if difficulty_raw == "MEDIUM" else "HARD")
    tags = [t["name"] for t in q_data.get("topicTags", [])]
    if not tags and leetscrape_data and hasattr(leetscrape_data, "topics"):
        tags = leetscrape_data.topics or []

    content_html = q_data.get("content") or (leetscrape_data.Body if leetscrape_data else "")
    parsed_content = parse_html_content(content_html)

    # Starter codes
    starter_code = map_code_snippets(q_data.get("codeSnippets", []))
    if "python" not in starter_code and leetscrape_data and hasattr(leetscrape_data, "Code"):
        starter_code["python"] = leetscrape_data.Code

    # Test cases: pair exampleTestcaseList with expected outputs from examples
    example_inputs = q_data.get("exampleTestcaseList", [])
    parsed_examples = parsed_content["examples"]
    test_cases = []

    for idx, inp in enumerate(example_inputs):
        expected_out = ""
        if idx < len(parsed_examples):
            expected_out = parsed_examples[idx].get("output", "")
        test_cases.append({
            "input": inp.strip(),
            "expected": expected_out.strip()
        })

    # If exampleTestcaseList was empty, build from parsed examples
    if not test_cases and parsed_examples:
        for ex in parsed_examples:
            test_cases.append({
                "input": ex.get("input", ""),
                "expected": ex.get("output", "")
            })

    result = {
        "slug": slug,
        "title": title,
        "difficulty": difficulty,
        "tags": tags,
        "description": parsed_content.get("clean_html", content_html),
        "examples": parsed_content["examples"],
        "constraints": parsed_content["constraints"],
        "starterCode": starter_code,
        "testCases": test_cases,
        "hints": q_data.get("hints", []),
        "frontendId": q_data.get("questionFrontendId") or (str(leetscrape_data.QID) if leetscrape_data else "1")
    }

    return result

def main():
    parser = argparse.ArgumentParser(description="Fetch problem from LeetCode using leetscrape & GraphQL")
    parser.add_argument("problem", nargs="?", help="LeetCode slug or URL (e.g. two-sum)")
    parser.add_argument("--json", action="store_true", help="Output raw JSON to stdout")
    parser.add_argument("--popular", action="store_true", help="List popular supported problems")
    parser.add_argument("--batch", nargs="+", help="Batch fetch multiple problems")

    args = parser.parse_args()

    if args.popular:
        print(json.dumps(POPULAR_PROBLEMS, indent=2))
        return

    if args.batch:
        results = []
        for p in args.batch:
            try:
                data = fetch_problem(p)
                results.append(data)
                print(f"[OK] Fetched {data['title']}", file=sys.stderr)
            except Exception as e:
                print(f"[FAIL] {p}: {e}", file=sys.stderr)
        print(json.dumps(results, indent=2))
        return

    if not args.problem:
        parser.print_help()
        sys.exit(1)

    try:
        problem_data = fetch_problem(args.problem)
        print(json.dumps(problem_data, indent=2))
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
