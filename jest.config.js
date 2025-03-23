/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  transform: {
    "^.+\.tsx?$": ["ts-jest", {
      tsconfig: "./tsconfig.json"
    }],
  },
  moduleNameMapper: {
    '(.+)\\.js': '$1'
  },
};
