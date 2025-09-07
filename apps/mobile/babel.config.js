module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          alias: {
            '@': './src',                 // lógica (context, services, utils…)
            '@components': './components' // 👈 carpeta fuera de app/
            // si quieres: '@assets': './assets'
          },
        },
      ],
      'react-native-reanimated/plugin', // siempre al final
    ],
  };
};
