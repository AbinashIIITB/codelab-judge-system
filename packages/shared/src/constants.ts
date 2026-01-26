import { Language } from './types';

// ==================== Language Configuration ====================
export const SUPPORTED_LANGUAGES: Language[] = ['cpp', 'python', 'java', 'javascript'];

export const LANGUAGE_CONFIG: Record<Language, {
    name: string;
    extension: string;
    monacoLanguage: string;
    dockerImage: string;
    compileCommand?: string;
    runCommand: string;
}> = {
    cpp: {
        name: 'C++',
        extension: 'cpp',
        monacoLanguage: 'cpp',
        dockerImage: 'codelab-cpp:latest',
        compileCommand: 'g++ -O2 -std=c++17 -o solution solution.cpp',
        runCommand: './solution',
    },
    python: {
        name: 'Python 3',
        extension: 'py',
        monacoLanguage: 'python',
        dockerImage: 'codelab-python:latest',
        runCommand: 'python3 solution.py',
    },
    java: {
        name: 'Java',
        extension: 'java',
        monacoLanguage: 'java',
        dockerImage: 'codelab-java:latest',
        compileCommand: 'javac Solution.java',
        runCommand: 'java Solution',
    },
    javascript: {
        name: 'JavaScript',
        extension: 'js',
        monacoLanguage: 'javascript',
        dockerImage: 'codelab-javascript:latest',
        runCommand: 'node solution.js',
    },
};

// ==================== Execution Limits ====================
export const DEFAULT_TIME_LIMIT = 2000;  // 2 seconds in ms
export const DEFAULT_MEMORY_LIMIT = 256; // 256 MB
export const MAX_TIME_LIMIT = 5000;      // 5 seconds
export const MAX_MEMORY_LIMIT = 512;     // 512 MB

// ==================== Queue Configuration ====================
export const SUBMISSION_QUEUE_NAME = 'submissions';
export const RUN_CODE_QUEUE_NAME = 'run-code';

// ==================== Verdicts ====================
export const VERDICT_COLORS: Record<string, string> = {
    'Accepted': 'green',
    'Wrong Answer': 'red',
    'Time Limit Exceeded': 'yellow',
    'Memory Limit Exceeded': 'orange',
    'Runtime Error': 'red',
    'Compilation Error': 'red',
};

// ==================== Starter Code Templates ====================
export const STARTER_CODE: Record<Language, string> = {
    cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    // Your code here
    
    return 0;
}`,
    python: `# Your code here

def main():
    pass

if __name__ == "__main__":
    main()`,
    java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Your code here
        
        sc.close();
    }
}`,
    javascript: `// Your code here

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let lines = [];
rl.on('line', (line) => {
    lines.push(line);
});

rl.on('close', () => {
    // Process input here
    
});`,
};
