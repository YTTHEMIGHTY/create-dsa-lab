// @version 1.2.0
import chalk from 'chalk';

export const ErrorCodes = {
  CONFIG_NOT_FOUND: 'CONFIG_NOT_FOUND',
  CONFIG_PARSE_ERROR: 'CONFIG_PARSE_ERROR',
  CONFIG_INVALID_FIELD: 'CONFIG_INVALID_FIELD',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  DIR_ALREADY_EXISTS: 'DIR_ALREADY_EXISTS',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  EMPTY_SRC: 'EMPTY_SRC',
  IMPORT_FAILED: 'IMPORT_FAILED',
  NO_DEFAULT_EXPORT: 'NO_DEFAULT_EXPORT',
  EXECUTION_ERROR: 'EXECUTION_ERROR',
  INVALID_NAME: 'INVALID_NAME',
  UNKNOWN_TYPE: 'UNKNOWN_TYPE',
  MISSING_ARGS: 'MISSING_ARGS',
  TEST_FILE_NOT_FOUND: 'TEST_FILE_NOT_FOUND',
  TEST_RUN_FAILED: 'TEST_RUN_FAILED',
  NOTES_SERVER_ERROR: 'NOTES_SERVER_ERROR',
  PORT_IN_USE: 'PORT_IN_USE',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export class DsaLabError extends Error {
  constructor(
    message: string,
    public readonly suggestion: string,
    public readonly code: ErrorCode
  ) {
    super(message);
    this.name = 'DsaLabError';
  }
}

export function handleError(error: unknown, exitProcess = true): void {
  if (error instanceof DsaLabError) {
    console.error('');
    console.error(chalk.red(`  ✖ ${error.message}`));
    console.error(chalk.dim(`    → ${error.suggestion}`));
    console.error(chalk.dim(`    (${error.code})`));
    console.error('');
  } else if (error instanceof SyntaxError) {
    console.error('');
    console.error(chalk.red('  ✖ Syntax error in your code:'));
    console.error(chalk.dim(`    ${error.message}`));
    console.error('');
  } else if (error instanceof Error) {
    console.error('');
    console.error(chalk.red(`  ✖ ${error.message}`));
    if (error.stack) {
      const stackLines = error.stack.split('\n').slice(1, 4);
      for (const line of stackLines) {
        console.error(chalk.dim(`    ${line.trim()}`));
      }
    }
    console.error('');
  } else {
    console.error('');
    console.error(chalk.red('  ✖ An unexpected error occurred:'));
    console.error(chalk.dim(`    ${String(error)}`));
    console.error('');
  }

  if (exitProcess) process.exit(1);
}

export function warn(message: string, suggestion?: string): void {
  console.warn(chalk.yellow(`  ⚠ ${message}`));
  if (suggestion) console.warn(chalk.dim(`    → ${suggestion}`));
}
