export default {
  tabWidth: 2,
  printWidth: 100,
  semi: false,
  vueIndentScriptAndStyle: true,
  singleQuote: true,
  trailingComma: 'all',
  proseWrap: 'never',
  htmlWhitespaceSensitivity: 'strict',
  bracketSameLine: true,
  arrowParens: 'always',
  endOfLine: 'auto',
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 200,
      },
    },
  ],
}
