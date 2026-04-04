import { describe, test, expect } from '@jest/globals';

describe('Generator Templates', () => {
  test('name validation regex should accept valid names', () => {
    const isValidName = (str) => /^[a-zA-Z]+(_\d+)?$/.test(str);
    expect(isValidName('twoSum')).toBe(true);
    expect(isValidName('twoSum_1')).toBe(true);
    expect(isValidName('bubbleSort')).toBe(true);
    expect(isValidName('maximumSubarray_53')).toBe(true);
  });

  test('name validation regex should reject invalid names', () => {
    const isValidName = (str) => /^[a-zA-Z]+(_\d+)?$/.test(str);
    expect(isValidName('')).toBe(false);
    expect(isValidName('123')).toBe(false);
    expect(isValidName('two-sum')).toBe(false);
    expect(isValidName('two sum')).toBe(false);
    expect(isValidName('two_sum_three')).toBe(false);
    expect(isValidName('_leading')).toBe(false);
  });

  test('solution template should include meta export', () => {
    const name = 'testProblem';
    const template = `function ${name}() {\n  // Your code here\n}\nexport const meta = {\n  name: '${name}',\n};\nexport default ${name};\n`;
    expect(template).toContain('export const meta');
    expect(template).toContain('export default');
    expect(template).toContain(name);
  });

  test('test template should import from solution file', () => {
    const name = 'testProblem';
    const template = `import ${name} from './${name}.ts';\ndescribe('${name}', () => {\n  test('basic', () => {});\n});\n`;
    expect(template).toContain(`import ${name}`);
    expect(template).toContain(`describe('${name}'`);
  });
});
