/**
 * Compare actual output with expected output.
 * Handles common edge cases like trailing whitespace and newlines.
 */
export function compareOutput(
    actual: string,
    expected: string,
    options: {
        ignoreTrailingWhitespace?: boolean;
        ignoreCase?: boolean;
        floatTolerance?: number;
    } = {}
): boolean {
    const {
        ignoreTrailingWhitespace = true,
        ignoreCase = false,
        floatTolerance,
    } = options;

    let actualNormalized = actual;
    let expectedNormalized = expected;

    // Normalize line endings
    actualNormalized = actualNormalized.replace(/\r\n/g, '\n');
    expectedNormalized = expectedNormalized.replace(/\r\n/g, '\n');

    if (ignoreTrailingWhitespace) {
        // Remove trailing whitespace from each line and trim
        actualNormalized = actualNormalized
            .split('\n')
            .map(line => line.trimEnd())
            .join('\n')
            .trim();

        expectedNormalized = expectedNormalized
            .split('\n')
            .map(line => line.trimEnd())
            .join('\n')
            .trim();
    }

    if (ignoreCase) {
        actualNormalized = actualNormalized.toLowerCase();
        expectedNormalized = expectedNormalized.toLowerCase();
    }

    // Exact match
    if (actualNormalized === expectedNormalized) {
        return true;
    }

    // Float tolerance comparison
    if (floatTolerance !== undefined) {
        const actualLines = actualNormalized.split('\n');
        const expectedLines = expectedNormalized.split('\n');

        if (actualLines.length !== expectedLines.length) {
            return false;
        }

        for (let i = 0; i < actualLines.length; i++) {
            const actualTokens = actualLines[i].split(/\s+/);
            const expectedTokens = expectedLines[i].split(/\s+/);

            if (actualTokens.length !== expectedTokens.length) {
                return false;
            }

            for (let j = 0; j < actualTokens.length; j++) {
                const actualNum = parseFloat(actualTokens[j]);
                const expectedNum = parseFloat(expectedTokens[j]);

                if (isNaN(actualNum) || isNaN(expectedNum)) {
                    // Not a number, do exact match
                    if (actualTokens[j] !== expectedTokens[j]) {
                        return false;
                    }
                } else {
                    // Number comparison with tolerance
                    if (Math.abs(actualNum - expectedNum) > floatTolerance) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    return false;
}

/**
 * Format the difference between actual and expected output for display
 */
export function formatOutputDiff(actual: string, expected: string): string {
    const actualLines = actual.split('\n');
    const expectedLines = expected.split('\n');

    let diff = '';
    const maxLines = Math.max(actualLines.length, expectedLines.length);

    for (let i = 0; i < maxLines; i++) {
        const actualLine = actualLines[i] ?? '<missing>';
        const expectedLine = expectedLines[i] ?? '<missing>';

        if (actualLine !== expectedLine) {
            diff += `Line ${i + 1}:\n`;
            diff += `  Expected: "${expectedLine}"\n`;
            diff += `  Actual:   "${actualLine}"\n`;
        }
    }

    return diff || 'No differences found (check for hidden characters)';
}
