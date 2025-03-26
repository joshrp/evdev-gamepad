/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  transform: {
    "^.+\.tsx?$": ["ts-jest", {
      tsconfig: "./tsconfig.json",

    }],
  },
  rootDir: './test',
  moduleNameMapper: {
    '(.+)\\.js': '$1'
  },

};
