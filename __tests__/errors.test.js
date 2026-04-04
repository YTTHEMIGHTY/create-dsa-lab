import { describe, test, expect } from '@jest/globals';

describe('Error Handling', () => {
  test('DsaLabError should have message, suggestion, and code', () => {
    class DsaLabError extends Error {
      constructor(message, suggestion, code) {
        super(message);
        this.name = 'DsaLabError';
        this.suggestion = suggestion;
        this.code = code;
      }
    }

    const error = new DsaLabError('File not found', 'Check the file path', 'FILE_NOT_FOUND');
    expect(error.message).toBe('File not found');
    expect(error.suggestion).toBe('Check the file path');
    expect(error.code).toBe('FILE_NOT_FOUND');
    expect(error.name).toBe('DsaLabError');
    expect(error instanceof Error).toBe(true);
  });

  test('all error codes should be unique strings', () => {
    const ErrorCodes = {
      CONFIG_NOT_FOUND: 'CONFIG_NOT_FOUND', CONFIG_PARSE_ERROR: 'CONFIG_PARSE_ERROR',
      FILE_NOT_FOUND: 'FILE_NOT_FOUND', DIR_ALREADY_EXISTS: 'DIR_ALREADY_EXISTS',
      EMPTY_SRC: 'EMPTY_SRC', IMPORT_FAILED: 'IMPORT_FAILED',
      NO_DEFAULT_EXPORT: 'NO_DEFAULT_EXPORT', EXECUTION_ERROR: 'EXECUTION_ERROR',
      INVALID_NAME: 'INVALID_NAME', UNKNOWN_TYPE: 'UNKNOWN_TYPE',
      MISSING_ARGS: 'MISSING_ARGS', TEST_FILE_NOT_FOUND: 'TEST_FILE_NOT_FOUND',
      TEST_RUN_FAILED: 'TEST_RUN_FAILED', UNKNOWN: 'UNKNOWN',
    };
    const values = Object.values(ErrorCodes);
    expect(new Set(values).size).toBe(values.length);
  });

  test('sampleOutput property-existence check should handle undefined correctly', () => {
    const metaWithout = { name: 'test', time: 'O(n)' };
    expect('sampleOutput' in metaWithout).toBe(false);
    const metaWithUndefined = { name: 'test', sampleOutput: undefined };
    expect('sampleOutput' in metaWithUndefined).toBe(true);
    expect(metaWithUndefined.sampleOutput).toBeUndefined();
    const metaWithValue = { name: 'test', sampleOutput: [0, 1] };
    expect('sampleOutput' in metaWithValue).toBe(true);
    expect(JSON.stringify(metaWithValue.sampleOutput)).toBe('[0,1]');
  });
});
