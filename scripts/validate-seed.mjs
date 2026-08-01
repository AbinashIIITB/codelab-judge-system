#!/usr/bin/env node
/**
 * Run every seeded problem's official Python solution against all of its test
 * cases and fail if any expected output disagrees.
 *
 * A wrong expected-output is invisible until a user solves the problem and is
 * told they are wrong, so this guards the data the same way tests guard code.
 * Two Two Sum cases were broken this way: one expected indices summing to 12,
 * the other had two valid answers despite the problem promising exactly one.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const seedPath = join(repoRoot, 'apps/api/src/scripts/seed.ts');

const source = readFileSync(seedPath, 'utf8');
const start = source.indexOf('const problems = [');
const end = source.indexOf('\nasync function seed()');

if (start < 0 || end < 0) {
    console.error('Could not locate the problems array in seed.ts.');
    process.exit(1);
}

// seed.ts connects to Mongo on import, so evaluate just the array literal.
const arraySource = source.slice(start, end).replace(/starterCode:\s*STARTER_CODE,?/g, '');
const problems = new Function(`${arraySource}\nreturn problems;`)();

const normalise = (text) =>
    String(text).split('\n').map((line) => line.trimEnd()).join('\n').trim();

const workDir = mkdtempSync(join(tmpdir(), 'codelab-seed-'));
let checked = 0;
let failed = 0;

for (const problem of problems) {
    const solution = problem.solutions?.python;
    if (!solution) {
        console.error(`✗ ${problem.slug}: no official Python solution to validate against`);
        failed++;
        continue;
    }

    const solutionFile = join(workDir, `${problem.slug}.py`);
    writeFileSync(solutionFile, solution);

    const cases = [...(problem.sampleTestCases ?? []), ...(problem.hiddenTestCases ?? [])];
    for (const testCase of cases) {
        checked++;

        let actual;
        try {
            actual = execFileSync('python3', [solutionFile], {
                input: testCase.input.endsWith('\n') ? testCase.input : `${testCase.input}\n`,
                encoding: 'utf8',
                timeout: 15000,
            });
        } catch (error) {
            const detail = (error.stderr || error.message || '').toString().split('\n').filter(Boolean).pop();
            actual = `<crashed: ${detail}>`;
        }

        if (normalise(actual) !== normalise(testCase.expectedOutput)) {
            failed++;
            console.error(`✗ ${problem.slug} ${testCase.isHidden ? '(hidden)' : '(sample)'}`);
            console.error(`    input:    ${JSON.stringify(testCase.input)}`);
            console.error(`    expected: ${JSON.stringify(testCase.expectedOutput)}`);
            console.error(`    actual:   ${JSON.stringify(actual)}`);
        }
    }
}

if (failed > 0) {
    console.error(`\n${failed} of ${checked} seeded test cases disagree with the official solution.`);
    process.exit(1);
}

console.log(`✓ all ${checked} seeded test cases agree with their official solution`);
