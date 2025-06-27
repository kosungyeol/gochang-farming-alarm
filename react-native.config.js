module.exports = {
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-vector-icons/android',
          packageImportPath: 'import io.github.react_native_vector_icons.ReactNativeVectorIconsPackage;',
        },
      },
    },
    'react-native-tts': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-tts/android',
          packageImportPath: 'import net.no_mad.tts.TextToSpeechPackage;',
        },
      },
    },
  },
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts/'],
};
