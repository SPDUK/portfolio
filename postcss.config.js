module.exports = {
  plugins: [
    require('postcss-nested'),
    require('@tailwindcss/postcss'),
    require('postcss-preset-env')({
      stage: 0,
    }),
  ],
}
