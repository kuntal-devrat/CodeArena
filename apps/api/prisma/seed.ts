import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding problems...");

  await prisma.problem.createMany({
    skipDuplicates: true,
    data: [
      {
        slug: "two-sum",
        title: "Two Sum",
        difficulty: "EASY",
        tags: ["Array", "Hash Table"],
        description:
          "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
        examples: [
          { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] == 9" },
          { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
        ],
        constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Only one valid answer exists."],
        starterCode: {
          python: "def twoSum(nums: list[int], target: int) -> list[int]:\n    pass\n",
          javascript: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};\n",
          java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}\n",
          cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};\n",
        },
        testCases: [
          { input: "[2,7,11,15]\n9", expected: "[0,1]" },
          { input: "[3,2,4]\n6", expected: "[1,2]" },
          { input: "[3,3]\n6", expected: "[0,1]" },
        ],
      },
      {
        slug: "valid-parentheses",
        title: "Valid Parentheses",
        difficulty: "EASY",
        tags: ["Stack", "String"],
        description:
          "Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n- Open brackets must be closed by the same type of brackets.\n- Open brackets must be closed in the correct order.\n- Every close bracket has a corresponding open bracket of the same type.",
        examples: [
          { input: 's = "()"', output: "true" },
          { input: 's = "()[]{}"', output: "true" },
          { input: 's = "(]"', output: "false" },
        ],
        constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'"],
        starterCode: {
          python: "def isValid(s: str) -> bool:\n    pass\n",
          javascript: "/**\n * @param {string} s\n * @return {boolean}\n */\nvar isValid = function(s) {\n    \n};\n",
        },
        testCases: [
          { input: "()", expected: "true" },
          { input: "()[]{}", expected: "true" },
          { input: "(]", expected: "false" },
        ],
      },
      {
        slug: "longest-substring-without-repeating-characters",
        title: "Longest Substring Without Repeating Characters",
        difficulty: "MEDIUM",
        tags: ["Sliding Window", "Hash Table", "String"],
        description:
          "Given a string `s`, find the length of the longest substring without repeating characters.",
        examples: [
          { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with length 3.' },
          { input: 's = "bbbbb"', output: "1" },
          { input: 's = "pwwkew"', output: "3" },
        ],
        constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
        starterCode: {
          python: "def lengthOfLongestSubstring(s: str) -> int:\n    pass\n",
          javascript: "/**\n * @param {string} s\n * @return {number}\n */\nvar lengthOfLongestSubstring = function(s) {\n    \n};\n",
        },
        testCases: [
          { input: "abcabcbb", expected: "3" },
          { input: "bbbbb", expected: "1" },
          { input: "pwwkew", expected: "3" },
        ],
      },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
