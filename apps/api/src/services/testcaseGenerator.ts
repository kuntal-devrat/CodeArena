export interface TestCase {
  input: string;
  expected: string;
}

/**
 * Returns real test cases for a problem directly from the database.
 * - In "Run" mode (isRun: true): runs the first 2-3 sample test cases.
 * - In "Submit" mode (isRun: false): runs ALL real test cases stored in the database.
 */
export function getComprehensiveTestCases(
  _slug: string,
  baseTestCases: TestCase[],
  isRun: boolean
): TestCase[] {
  if (isRun) {
    return baseTestCases.slice(0, 3);
  }
  return baseTestCases;
}
