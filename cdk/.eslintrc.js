module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['airbnb-typescript-prettier'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: ['./tsconfig.json'],
      },
      rules: {
        'no-new': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  ],
};
