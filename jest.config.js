/** @type {import('jest').Config} */
export default {
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    transform: {
        '^.+\\.(ts|tsx)$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.app.json',
                jsx: 'react-jsx',
            },
        ],
        '^.+\\.(js|jsx|mjs)$': 'babel-jest',
    },
    transformIgnorePatterns: [
        '/node_modules/(?!antd|rc-[^/]+)', // Transform antd and rc-* (e.g., rc-picker)
    ],
    moduleNameMapper: {
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/test/__mocks__/fileMock.js',
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
        '^@/(.*)$': '<rootDir>/src/$1',
    },
};