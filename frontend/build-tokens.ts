import { register } from '@tokens-studio/sd-transforms';
import StyleDictionary from 'style-dictionary';

register(StyleDictionary,{ excludeParentKeys: true });

const sd = new StyleDictionary({
  source: ['design-system/tokens.json'],
  preprocessors: ['tokens-studio'],
  log: {
    verbosity: 'verbose',
  },
  platforms: {
    scss: {
      transformGroup: 'tokens-studio',
      transforms: ["name/kebab"],
      buildPath: 'src/shared/styles/',
      files: [
        {
          destination: 'tokens.scss',
          format: 'scss/variables',
        },
      ],
    },
  },
});

await sd.buildAllPlatforms();