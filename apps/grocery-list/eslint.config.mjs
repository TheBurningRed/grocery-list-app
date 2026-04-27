import nx from '@nx/eslint-plugin';
import unusedImports from 'eslint-plugin-unused-imports';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  ...baseConfig,
  {
    files: ['**/*.ts'],
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],

      // Angular consistency
      '@angular-eslint/component-class-suffix': [
        'error',
        {
          suffixes: ['Component'],
        },
      ],
      '@angular-eslint/contextual-lifecycle': 'error',
      '@angular-eslint/directive-class-suffix': [
        'error',
        {
          suffixes: ['Directive'],
        },
      ],
      '@angular-eslint/no-async-lifecycle-method': 'error',
      '@angular-eslint/no-attribute-decorator': 'warn',
      '@angular-eslint/no-conflicting-lifecycle': 'error',
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/no-input-prefix': 'error',
      '@angular-eslint/no-input-rename': 'warn',
      '@angular-eslint/no-inputs-metadata-property': 'error',
      '@angular-eslint/no-lifecycle-call': 'error',
      '@angular-eslint/no-output-native': 'error',
      '@angular-eslint/no-output-on-prefix': 'error',
      '@angular-eslint/no-output-rename': 'warn',
      '@angular-eslint/no-outputs-metadata-property': 'error',
      '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
      '@angular-eslint/prefer-output-emitter-ref': 'warn',
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/relative-url-prefix': 'error',
      '@angular-eslint/use-lifecycle-interface': 'warn',
      '@angular-eslint/use-pipe-transform-interface': 'error',
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: [
            'decorated-field',
            'decorated-set',
            'decorated-method',
            'static-field',
            'instance-field',
            'abstract-field',
            'signature',
            'call-signature',
            'constructor',
            'static-method',
            'instance-method',
            'abstract-method',
          ],
        },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: false,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],
      'max-len': [
        'error',
        {
          code: 140,
          ignoreComments: true,
        },
      ],
      'no-eval': 'error',
      'unused-imports/no-unused-imports': 'error',
      '@angular-eslint/prefer-signals': 'error',
    },
  },
  {
    files: ['**/*.html'],
    rules: {
      '@angular-eslint/template/alt-text': 'error',
      '@angular-eslint/template/attributes-order': 'warn',
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/conditional-complexity': [
        'warn',
        {
          maxComplexity: 4,
        },
      ],
      '@angular-eslint/template/cyclomatic-complexity': [
        'warn',
        {
          maxComplexity: 5,
        },
      ],
      '@angular-eslint/template/eqeqeq': 'error',
      '@angular-eslint/template/interactive-supports-focus': 'warn',
      '@angular-eslint/template/label-has-associated-control': 'warn',
      '@angular-eslint/template/mouse-events-have-key-events': 'warn',
      '@angular-eslint/template/no-any': 'warn',
      '@angular-eslint/template/no-autofocus': 'warn',
      '@angular-eslint/template/no-distracting-elements': 'error',
      '@angular-eslint/template/no-duplicate-attributes': 'error',
      '@angular-eslint/template/no-inline-styles': 'warn',
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/prefer-control-flow': 'warn',
      '@angular-eslint/template/role-has-required-aria': 'warn',
      '@angular-eslint/template/table-scope': 'error',
      '@angular-eslint/template/valid-aria': 'error',
    },
  },
];
