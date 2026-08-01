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
            // nums[2] + nums[3] = 3 + 7 = 10. Was '1 3', which sums to 12, so a
            // correct solution was marked Wrong Answer.
            { input: '5\n1 5 3 7 2\n10', expectedOutput: '2 3', isHidden: true },
            // target 11 has exactly one pair (5 + 6). The previous target of 3 had
            // two — -1+4 and -3+6 — which contradicts the problem's guarantee of a
            // single answer and made the verdict depend on iteration order.
            { input: '6\n-1 -2 -3 4 5 6\n11', expectedOutput: '4 5', isHidden: true },
        ],
        tags: ['array', 'hash-table'],
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: STARTER_CODE,
        solutions: {
            cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }
    
    int target;
    cin >> target;
    
    unordered_map<int, int> mp;
    for (int i = 0; i < n; i++) {
        int complement = target - nums[i];
        if (mp.find(complement) != mp.end()) {
            cout << mp[complement] << " " << i;
            return 0;
        }
        mp[nums[i]] = i;
    }
    
    return 0;
}`,
            python: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
        
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    target = int(input_data[n+1])
    
    prevMap = {} # val : index
    
    for i, n in enumerate(nums):
        diff = target - n
        if diff in prevMap:
            print(f"{prevMap[diff]} {i}")
            return
        prevMap[n] = i

if __name__ == "__main__":
    solve()`,
            java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }
        
        int target = sc.nextInt();
        Map<Integer, Integer> prevMap = new HashMap<>();
        
        for (int i = 0; i < n; i++) {
            int diff = target - nums[i];
            if (prevMap.containsKey(diff)) {
                System.out.println(prevMap.get(diff) + " " + i);
                return;
            }
            prevMap.put(nums[i], i);
        }
        
        sc.close();
    }
}`,
            javascript: `const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let input = '';
rl.on('line', (line) => {
    input += line + ' ';
});

rl.on('close', () => {
    const data = input.trim().split(/\\s+/).map(Number);
    if (data.length < 2) return;
    
    const n = data[0];
    const nums = data.slice(1, n + 1);
    const target = data[n + 1];
    
    const prevMap = new Map();
    for (let i = 0; i < n; i++) {
        const diff = target - nums[i];
        if (prevMap.has(diff)) {
            console.log(\`\${prevMap.get(diff)} \${i}\`);
            return;
        }
        prevMap.set(nums[i], i);
    }
});`
        },
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
        solutions: {
            cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    if (n == 0) return 0;
    
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    
    for (int i = n - 1; i >= 0; i--) {
        cout << nums[i] << (i == 0 ? "" : " ");
    }
    return 0;
}`,
            python: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data: return
    
    n = int(input_data[0])
    if n == 0: return
    
    nums = input_data[1:n+1]
    print(" ".join(nums[::-1]))

if __name__ == "__main__":
    solve()`,
            java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        
        for (int i = n - 1; i >= 0; i--) {
            System.out.print(nums[i] + (i == 0 ? "" : " "));
        }
    }
}`,
            javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, terminal: false });

let input = '';
rl.on('line', (line) => input += line + ' ');
rl.on('close', () => {
    const data = input.trim().split(/\\s+/).map(Number);
    if (data.length < 1) return;
    const n = data[0];
    if (n === 0) return;
    const nums = data.slice(1, n + 1);
    console.log(nums.reverse().join(' '));
});`
        },
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
        solutions: {
            cpp: `#include <iostream>
#include <string>
#include <stack>
#include <unordered_map>
using namespace std;

bool isValid(string s) {
    stack<char> st;
    unordered_map<char, char> mapping = {{')', '('}, {'}', '{'}, {']', '['}};
    
    for (char c : s) {
        if (mapping.find(c) != mapping.end()) {
            char top = st.empty() ? '#' : st.top();
            if (top != mapping[c]) return false;
            st.pop();
        } else {
            st.push(c);
        }
    }
    return st.empty();
}

int main() {
    string s;
    if (!(cin >> s)) return 0;
    cout << (isValid(s) ? "true" : "false");
    return 0;
}`,
            python: `import sys

def isValid(s):
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top_element = stack.pop() if stack else '#'
            if mapping[char] != top_element:
                return False
        else:
            stack.append(char)
    return not stack

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if not line:
        sys.exit(0)
    print("true" if isValid(line) else "false")`,
            java: `import java.util.*;

public class Solution {
    public static boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        Map<Character, Character> mapping = new HashMap<>();
        mapping.put(')', '(');
        mapping.put('}', '{');
        mapping.put(']', '[');
        
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (mapping.containsKey(c)) {
                char topElement = stack.empty() ? '#' : stack.pop();
                if (topElement != mapping.get(c)) return false;
            } else {
                stack.push(c);
            }
        }
        return stack.isEmpty();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        System.out.print(isValid(s) ? "true" : "false");
    }
}`,
            javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, terminal: false });

rl.on('line', (line) => {
    const s = line.trim();
    if (!s) return;
    
    const isValid = (s) => {
        const stack = [];
        const mapping = { ')': '(', '}': '{', ']': '[' };
        for (let char of s) {
            if (mapping[char]) {
                const top = stack.pop() || '#';
                if (top !== mapping[char]) return false;
            } else {
                stack.push(char);
            }
        }
        return stack.length === 0;
    };
    
    process.stdout.write(isValid(s) ? "true" : "false");
});`
        },
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
        solutions: {
            cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n, m;
    if (!(cin >> n)) return 0;
    vector<int> l1(n);
    for (int i = 0; i < n; i++) cin >> l1[i];
    
    if (!(cin >> m)) return 0;
    vector<int> l2(m);
    for (int i = 0; i < m; i++) cin >> l2[i];
    
    vector<int> res;
    int i = 0, j = 0;
    while (i < n && j < m) {
        if (l1[i] < l2[j]) res.push_back(l1[i++]);
        else res.push_back(l2[j++]);
    }
    while (i < n) res.push_back(l1[i++]);
    while (j < m) res.push_back(l2[j++]);
    
    for (int k = 0; k < res.size(); k++) {
        cout << res[k] << (k == res.size() - 1 ? "" : " ");
    }
    return 0;
}`,
            python: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data: return
    
    ptr = 0
    n = int(input_data[ptr])
    ptr += 1
    l1 = [int(x) for x in input_data[ptr:ptr+n]]
    ptr += n
    
    m = int(input_data[ptr])
    ptr += 1
    l2 = [int(x) for x in input_data[ptr:ptr+m]]
    
    res = sorted(l1 + l2)
    print(" ".join(map(str, res)))

if __name__ == "__main__":
    solve()`,
            java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        
        int n = sc.nextInt();
        int[] l1 = new int[n];
        for (int i = 0; i < n; i++) l1[i] = sc.nextInt();
        
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        int[] l2 = new int[m];
        for (int i = 0; i < m; i++) l2[i] = sc.nextInt();
        
        List<Integer> res = new ArrayList<>();
        for (int x : l1) res.add(x);
        for (int x : l2) res.add(x);
        Collections.sort(res);
        
        for (int i = 0; i < res.size(); i++) {
            System.out.print(res.get(i) + (i == res.size() - 1 ? "" : " "));
        }
    }
}`,
            javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, terminal: false });

let input = '';
rl.on('line', (line) => input += line + ' ');
rl.on('close', () => {
    const data = input.trim().split(/\\s+/).map(Number);
    if (data.length < 1) return;
    
    let ptr = 0;
    const n = data[ptr++];
    const l1 = data.slice(ptr, ptr + n);
    ptr += n;
    
    const m = data[ptr++];
    const l2 = data.slice(ptr, ptr + m);
    
    const res = [...l1, ...l2].sort((a, b) => a - b);
    console.log(res.join(' '));
});`
        },
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
        solutions: {
            cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> prices(n);
    for (int i = 0; i < n; i++) cin >> prices[i];
    
    if (n == 0) {
        cout << 0;
        return 0;
    }
    
    int minPrice = 1e9;
    int maxProfit = 0;
    for (int price : prices) {
        minPrice = min(minPrice, price);
        maxProfit = max(maxProfit, price - minPrice);
    }
    cout << maxProfit;
    return 0;
}`,
            python: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data: return
    
    n = int(input_data[0])
    prices = [int(x) for x in input_data[1:n+1]]
    
    if not prices:
        print(0)
        return
        
    min_price = float('inf')
    max_profit = 0
    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > max_profit:
            max_profit = price - min_price
    print(max_profit)

if __name__ == "__main__":
    solve()`,
            java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        
        int n = sc.nextInt();
        int[] prices = new int[n];
        for (int i = 0; i < n; i++) prices[i] = sc.nextInt();
        
        if (n == 0) {
            System.out.print(0);
            return;
        }
        
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        for (int price : prices) {
            if (price < minPrice) minPrice = price;
            else if (price - minPrice > maxProfit) maxProfit = price - minPrice;
        }
        System.out.print(maxProfit);
    }
}`,
            javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, terminal: false });

let input = '';
rl.on('line', (line) => input += line + ' ');
rl.on('close', () => {
    const data = input.trim().split(/\\s+/).map(Number);
    if (data.length < 1) return;
    
    const n = data[0];
    const prices = data.slice(1, n + 1);
    
    if (prices.length === 0) {
        console.log(0);
        return;
    }
    
    let minPrice = Infinity;
    let maxProfit = 0;
    for (let price of prices) {
        if (price < minPrice) minPrice = price;
        else if (price - minPrice > maxProfit) maxProfit = price - minPrice;
    }
    process.stdout.write(maxProfit.toString());
});`
        },
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
