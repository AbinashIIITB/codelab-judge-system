import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Problem } from '../models';
import { STARTER_CODE } from '@codelab/shared';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codelab';

const problems = [
    {
        slug: 'two-sum',
        title: 'Two Sum',
        difficulty: 'Easy',
        description: `# Two Sum

Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

## Example 1:

\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

## Example 2:

\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

## Example 3:

\`\`\`
Input: nums = [3,3], target = 6
Output: [0,1]
\`\`\``,
        constraints: [
            '2 <= nums.length <= 10^4',
            '-10^9 <= nums[i] <= 10^9',
            '-10^9 <= target <= 10^9',
            'Only one valid answer exists.',
        ],
        sampleTestCases: [
            { input: '4\n2 7 11 15\n9', expectedOutput: '0 1', isHidden: false },
            { input: '3\n3 2 4\n6', expectedOutput: '1 2', isHidden: false },
        ],
        hiddenTestCases: [
            { input: '2\n3 3\n6', expectedOutput: '0 1', isHidden: true },
            { input: '5\n1 5 3 7 2\n10', expectedOutput: '1 3', isHidden: true },
            { input: '6\n-1 -2 -3 4 5 6\n3', expectedOutput: '2 5', isHidden: true },
        ],
        tags: ['array', 'hash-table'],
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: STARTER_CODE,
    },
    {
        slug: 'reverse-linked-list',
        title: 'Reverse Linked List',
        difficulty: 'Easy',
        description: `# Reverse Linked List

Given the \`head\` of a singly linked list, reverse the list, and return *the reversed list*.

## Example 1:

\`\`\`
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]
\`\`\`

## Example 2:

\`\`\`
Input: head = [1,2]
Output: [2,1]
\`\`\`

## Example 3:

\`\`\`
Input: head = []
Output: []
\`\`\`

## Input Format

The first line contains \`n\` - the number of nodes.
The second line contains \`n\` space-separated integers representing node values.

## Output Format

Print the reversed list as space-separated values.`,
        constraints: [
            'The number of nodes in the list is in the range [0, 5000].',
            '-5000 <= Node.val <= 5000',
        ],
        sampleTestCases: [
            { input: '5\n1 2 3 4 5', expectedOutput: '5 4 3 2 1', isHidden: false },
            { input: '2\n1 2', expectedOutput: '2 1', isHidden: false },
        ],
        hiddenTestCases: [
            { input: '0', expectedOutput: '', isHidden: true },
            { input: '1\n1', expectedOutput: '1', isHidden: true },
            { input: '10\n1 2 3 4 5 6 7 8 9 10', expectedOutput: '10 9 8 7 6 5 4 3 2 1', isHidden: true },
        ],
        tags: ['linked-list', 'recursion'],
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: STARTER_CODE,
    },
    {
        slug: 'valid-parentheses',
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        description: `# Valid Parentheses

Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:

1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

## Example 1:

\`\`\`
Input: s = "()"
Output: true
\`\`\`

## Example 2:

\`\`\`
Input: s = "()[]{}"
Output: true
\`\`\`

## Example 3:

\`\`\`
Input: s = "(]"
Output: false
\`\`\`

## Input Format

A single line containing the string \`s\`.

## Output Format

Print \`true\` if valid, \`false\` otherwise.`,
        constraints: [
            '1 <= s.length <= 10^4',
            's consists of parentheses only \'()[]{}\'.',
        ],
        sampleTestCases: [
            { input: '()', expectedOutput: 'true', isHidden: false },
            { input: '()[]{}', expectedOutput: 'true', isHidden: false },
            { input: '(]', expectedOutput: 'false', isHidden: false },
        ],
        hiddenTestCases: [
            { input: '([)]', expectedOutput: 'false', isHidden: true },
            { input: '{[]}', expectedOutput: 'true', isHidden: true },
            { input: '((((({[]})))))', expectedOutput: 'true', isHidden: true },
            { input: '(((', expectedOutput: 'false', isHidden: true },
        ],
        tags: ['string', 'stack'],
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: STARTER_CODE,
    },
    {
        slug: 'merge-two-sorted-lists',
        title: 'Merge Two Sorted Lists',
        difficulty: 'Easy',
        description: `# Merge Two Sorted Lists

You are given the heads of two sorted linked lists \`list1\` and \`list2\`.

Merge the two lists into one **sorted** list. The list should be made by splicing together the nodes of the first two lists.

Return *the head of the merged linked list*.

## Example 1:

\`\`\`
Input: list1 = [1,2,4], list2 = [1,3,4]
Output: [1,1,2,3,4,4]
\`\`\`

## Example 2:

\`\`\`
Input: list1 = [], list2 = []
Output: []
\`\`\`

## Example 3:

\`\`\`
Input: list1 = [], list2 = [0]
Output: [0]
\`\`\`

## Input Format

First line: \`n\` - length of list1
Second line: \`n\` space-separated integers (or empty)
Third line: \`m\` - length of list2
Fourth line: \`m\` space-separated integers (or empty)

## Output Format

Print the merged sorted list as space-separated values.`,
        constraints: [
            'The number of nodes in both lists is in the range [0, 50].',
            '-100 <= Node.val <= 100',
            'Both list1 and list2 are sorted in non-decreasing order.',
        ],
        sampleTestCases: [
            { input: '3\n1 2 4\n3\n1 3 4', expectedOutput: '1 1 2 3 4 4', isHidden: false },
            { input: '0\n\n0', expectedOutput: '', isHidden: false },
        ],
        hiddenTestCases: [
            { input: '0\n\n1\n0', expectedOutput: '0', isHidden: true },
            { input: '5\n1 3 5 7 9\n5\n2 4 6 8 10', expectedOutput: '1 2 3 4 5 6 7 8 9 10', isHidden: true },
            { input: '3\n-5 0 5\n3\n-3 0 3', expectedOutput: '-5 -3 0 0 3 5', isHidden: true },
        ],
        tags: ['linked-list', 'recursion'],
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: STARTER_CODE,
    },
    {
        slug: 'best-time-to-buy-and-sell-stock',
        title: 'Best Time to Buy and Sell Stock',
        difficulty: 'Medium',
        description: `# Best Time to Buy and Sell Stock

You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i-th\` day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return *the maximum profit you can achieve from this transaction*. If you cannot achieve any profit, return \`0\`.

## Example 1:

\`\`\`
Input: prices = [7,1,5,3,6,4]
Output: 5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.
Note that buying on day 2 and selling on day 1 is not allowed because you must buy before you sell.
\`\`\`

## Example 2:

\`\`\`
Input: prices = [7,6,4,3,1]
Output: 0
Explanation: In this case, no transactions are done and the max profit = 0.
\`\`\`

## Input Format

First line: \`n\` - number of days
Second line: \`n\` space-separated integers representing prices

## Output Format

Print the maximum profit.`,
        constraints: [
            '1 <= prices.length <= 10^5',
            '0 <= prices[i] <= 10^4',
        ],
        sampleTestCases: [
            { input: '6\n7 1 5 3 6 4', expectedOutput: '5', isHidden: false },
            { input: '5\n7 6 4 3 1', expectedOutput: '0', isHidden: false },
        ],
        hiddenTestCases: [
            { input: '2\n1 2', expectedOutput: '1', isHidden: true },
            { input: '3\n2 4 1', expectedOutput: '2', isHidden: true },
            { input: '10\n3 2 6 5 0 3 1 4 2 8', expectedOutput: '8', isHidden: true },
            { input: '1\n5', expectedOutput: '0', isHidden: true },
        ],
        tags: ['array', 'dynamic-programming'],
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: STARTER_CODE,
    },
];

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing problems
        await Problem.deleteMany({});
        console.log('🗑️  Cleared existing problems');

        // Insert new problems
        await Problem.insertMany(problems);
        console.log(`✅ Seeded ${problems.length} problems`);

        // List inserted problems
        const inserted = await Problem.find().select('slug title difficulty');
        console.log('\nInserted problems:');
        inserted.forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.title} (${p.difficulty}) - /${p.slug}`);
        });

        await mongoose.disconnect();
        console.log('\n✅ Database seeding complete!');
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();
