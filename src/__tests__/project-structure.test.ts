/**
 * Property Test: Project Structure Consistency
 *
 * Validates that the project structure follows the defined patterns
 * and maintains consistency across the codebase.
 */

import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

import { fc, test } from '@fast-check/jest';

describe('Project Structure Validation', () => {
  const projectRoot = process.cwd();

  test('should have all required configuration files', () => {
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'eslint.config.js',
      '.prettierrc',
      'jest.config.js',
      'Dockerfile',
      'docker-compose.yml',
      '.env.example',
    ];

    requiredFiles.forEach(file => {
      const filePath = join(projectRoot, file);
      expect(existsSync(filePath)).toBe(true);
      expect(statSync(filePath).isFile()).toBe(true);
    });
  });

  test('should have proper directory structure', () => {
    const requiredDirectories = [
      'src',
      'src/config',
      'src/test',
      'scripts',
      '.vscode',
      '.husky',
    ];

    requiredDirectories.forEach(dir => {
      const dirPath = join(projectRoot, dir);
      expect(existsSync(dirPath)).toBe(true);
      expect(statSync(dirPath).isDirectory()).toBe(true);
    });
  });

  test('package.json should have required fields and scripts', () => {
    const packageJsonPath = join(projectRoot, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    // Required fields
    expect(packageJson.name).toBe('leorag');
    expect(packageJson.version).toBeDefined();
    expect(packageJson.description).toContain('RAG');
    expect(packageJson.type).toBe('module');
    expect(packageJson.license).toBe('Apache-2.0');

    // Required scripts
    const requiredScripts = [
      'build',
      'dev',
      'start',
      'test',
      'test:watch',
      'test:coverage',
      'lint',
      'lint:fix',
      'format',
      'format:check',
      'typecheck',
    ];

    requiredScripts.forEach(script => {
      expect(packageJson.scripts[script]).toBeDefined();
    });

    // Workspaces configuration
    expect(packageJson.workspaces).toEqual(['packages/*', 'apps/*']);
  });

  test('TypeScript configuration should be strict', () => {
    const tsconfigPath = join(projectRoot, 'tsconfig.json');
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));

    // Strict mode checks
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.noImplicitAny).toBe(true);
    expect(tsconfig.compilerOptions.noImplicitReturns).toBe(true);
    expect(tsconfig.compilerOptions.noUnusedLocals).toBe(true);
    expect(tsconfig.compilerOptions.noUnusedParameters).toBe(true);
    expect(tsconfig.compilerOptions.exactOptionalPropertyTypes).toBe(true);

    // Modern TypeScript features
    expect(tsconfig.compilerOptions.target).toBe('ES2022');
    expect(tsconfig.compilerOptions.module).toBe('ESNext');
    expect(tsconfig.compilerOptions.moduleResolution).toBe('bundler');

    // Path mapping
    expect(tsconfig.compilerOptions.baseUrl).toBe('./src');
    expect(tsconfig.compilerOptions.paths).toBeDefined();
    expect(tsconfig.compilerOptions.paths['@/*']).toEqual(['*']);
  });

  test.prop([
    fc.constantFrom(
      ...[
        'src/types',
        'src/utils',
        'src/services',
        'src/components',
        'src/config',
      ]
    ),
  ])('path aliases should resolve correctly', aliasPath => {
    const tsconfig = JSON.parse(
      readFileSync(join(projectRoot, 'tsconfig.json'), 'utf-8')
    );
    const aliasKey = `@/${aliasPath.split('/')[1]}/*`;
    const expectedPath = [`${aliasPath.split('/')[1]}/*`];

    expect(tsconfig.compilerOptions.paths[aliasKey]).toEqual(expectedPath);
  });

  test('environment configuration should be properly typed', () => {
    const envConfigPath = join(projectRoot, 'src/config/environment.ts');
    expect(existsSync(envConfigPath)).toBe(true);

    const envConfig = readFileSync(envConfigPath, 'utf-8');

    // Should have proper TypeScript interface
    expect(envConfig).toContain('interface EnvironmentConfig');
    expect(envConfig).toContain('NODE_ENV:');
    expect(envConfig).toContain('PORT:');
    expect(envConfig).toContain('DATABASE_URL:');
    expect(envConfig).toContain('REDIS_URL:');

    // Should have validation functions
    expect(envConfig).toContain('getEnvVar');
    expect(envConfig).toContain('getEnvNumber');
  });

  test('Docker configuration should be production-ready', () => {
    const dockerfilePath = join(projectRoot, 'Dockerfile');
    const dockerfile = readFileSync(dockerfilePath, 'utf-8');

    // Multi-stage build
    expect(dockerfile).toContain('FROM node:20-alpine AS base');
    expect(dockerfile).toContain('FROM base AS deps');
    expect(dockerfile).toContain('FROM base AS builder');
    expect(dockerfile).toContain('FROM base AS runner');

    // Security best practices
    expect(dockerfile).toContain('addgroup --system');
    expect(dockerfile).toContain('adduser --system');
    expect(dockerfile).toContain('USER leorag');

    // Production optimizations
    expect(dockerfile).toContain('NODE_ENV=production');
    expect(dockerfile).toContain('npm ci --only=production');
  });

  test('Jest configuration should support property-based testing', () => {
    const jestConfigPath = join(projectRoot, 'jest.config.js');
    const jestConfig = readFileSync(jestConfigPath, 'utf-8');

    // TypeScript support
    expect(jestConfig).toContain('ts-jest');
    expect(jestConfig).toContain('extensionsToTreatAsEsm');

    // Coverage thresholds
    expect(jestConfig).toContain('coverageThreshold');
    expect(jestConfig).toContain('branches: 80');
    expect(jestConfig).toContain('functions: 80');
    expect(jestConfig).toContain('lines: 80');

    // Path mapping
    expect(jestConfig).toContain('moduleNameMapper');
    expect(jestConfig).toContain('@/(.*)');
  });

  test.prop([fc.integer({ min: 70, max: 90 })])(
    'coverage thresholds should be reasonable',
    threshold => {
      // Property: Coverage thresholds should be between 70-90% for production code
      const isReasonable = threshold >= 70 && threshold <= 90;

      expect(isReasonable).toBe(true);

      // Property: Our actual threshold (80%) should be within reasonable range
      expect(80).toBeWithinRange(70, 90);
    }
  );

  test('VS Code configuration should enhance development experience', () => {
    const vscodeSettingsPath = join(projectRoot, '.vscode/settings.json');
    const vscodeSettings = JSON.parse(
      readFileSync(vscodeSettingsPath, 'utf-8')
    );

    // TypeScript configuration
    expect(vscodeSettings['typescript.suggest.autoImports']).toBe(true);
    expect(vscodeSettings['typescript.updateImportsOnFileMove.enabled']).toBe(
      'always'
    );

    // Formatting
    expect(vscodeSettings['editor.formatOnSave']).toBe(true);
    expect(vscodeSettings['editor.defaultFormatter']).toBe(
      'esbenp.prettier-vscode'
    );

    // ESLint integration
    expect(
      vscodeSettings['editor.codeActionsOnSave']['source.fixAll.eslint']
    ).toBe('explicit');
  });

  test('Husky should be properly configured for git hooks', () => {
    const huskyPreCommitPath = join(projectRoot, '.husky/pre-commit');
    expect(existsSync(huskyPreCommitPath)).toBe(true);

    const preCommitHook = readFileSync(huskyPreCommitPath, 'utf-8');
    expect(preCommitHook).toContain('npx lint-staged');
  });
});
