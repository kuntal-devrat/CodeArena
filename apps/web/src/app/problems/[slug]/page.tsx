import { ProblemWorkspace } from "@/components/leetcode/ProblemWorkspace";
import type { Problem } from "@codearena/shared";
import axios from "axios";

interface ProblemPageProps {
  params: { slug: string };
}

// Fallback problem definitions for preview/local dev when backend is booting
const FALLBACK_PROBLEMS: Record<string, Partial<Problem>> = {
  "two-sum": {
    id: "1",
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "EASY",
    tags: ["Array", "Hash Table"],
    description: `
      <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>
      <p>You may assume that each input would have <strong><em>exactly</em> one solution</strong>, and you may not use the <em>same</em> element twice.</p>
      <p>You can return the answer in any order.</p>
    `,
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
      { input: "nums = [3,3], target = 6", output: "[0,1]" },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    starterCode: {
      python: "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your code here\n        pass\n",
      javascript: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    // Write your code here\n};\n",
      typescript: "function twoSum(nums: number[], target: number): number[] {\n    // Write your code here\n};\n",
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n    }\n};\n",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n    }\n}\n",
      go: "func twoSum(nums []int, target int) []int {\n    // Write your code here\n}\n",
      rust: "impl Solution {\n    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {\n        // Write your code here\n    }\n}\n"
    },
    createdAt: new Date().toISOString(),
  },
  "valid-parentheses": {
    id: "2",
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "EASY",
    tags: ["Stack", "String"],
    description: `
      <p>Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.</p>
      <p>An input string is valid if:</p>
      <ol>
        <li>Open brackets must be closed by the same type of brackets.</li>
        <li>Open brackets must be closed in the correct order.</li>
        <li>Every close bracket has a corresponding open bracket of the same type.</li>
      </ol>
    `,
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" }
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    starterCode: {
      python: "class Solution:\n    def isValid(self, s: str) -> bool:\n        pass\n",
      javascript: "var isValid = function(s) {\n    \n};\n",
      typescript: "function isValid(s: string): boolean {\n    \n};\n",
      cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};\n",
      java: "class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}\n",
      go: "func isValid(s string) bool {\n    \n}\n",
      rust: "impl Solution {\n    pub fn is_valid(s: String) -> bool {\n        \n    }\n}\n"
    },
    createdAt: new Date().toISOString(),
  }
};

async function getProblem(slug: string): Promise<Problem> {
  const apiUrl = process.env.API_URL ?? "http://localhost:4000";
  try {
    const res = await axios.get(`${apiUrl}/api/problems/${slug}`, { timeout: 8000 });
    return res.data;
  } catch (_err) {
    // Return fallback if available
    if (FALLBACK_PROBLEMS[slug]) {
      return FALLBACK_PROBLEMS[slug] as Problem;
    }

    // Default generic stub
    const formattedTitle = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    return {
      id: slug,
      slug,
      title: formattedTitle,
      difficulty: "MEDIUM",
      tags: ["Algorithm"],
      description: `<p>Problem statement for <strong>${formattedTitle}</strong>.</p><p>Imported directly from LeetCode via <code>leetscrape</code>.</p>`,
      examples: [
        { input: "nums = [1,2,3]", output: "[3,2,1]" }
      ],
      constraints: ["1 <= input.length <= 10^5"],
      starterCode: {
        python: "class Solution:\n    def solve(self):\n        pass\n",
        javascript: "var solve = function() {\n    \n};\n",
        typescript: "function solve(): void {\n    \n};\n",
        cpp: "class Solution {\npublic:\n    void solve() {\n        \n    }\n};\n",
        java: "class Solution {\n    public void solve() {\n        \n    }\n}\n",
      },
      createdAt: new Date().toISOString(),
    };
  }
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const problem = await getProblem(params.slug);

  return <ProblemWorkspace initialProblem={problem} />;
}
