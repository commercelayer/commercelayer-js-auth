/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['@commercelayer/eslint-config-ts'],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module'
  }
}
