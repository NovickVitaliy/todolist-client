import '@testing-library/jest-dom';

jest.mock('dayjs', () => {
    const originalDayjs = jest.requireActual('dayjs');
    const mockDayjs = jest.fn((...args) => {
        const instance = originalDayjs(...args);
        instance.extend = jest.fn();
        instance.format = jest.fn().mockReturnValue('2023-01-01');
        instance.isValid = jest.fn().mockReturnValue(true);
        return instance;
    });
    mockDayjs.extend = jest.fn();
    mockDayjs.utc = jest.fn().mockImplementation((...args) => originalDayjs(...args));
    return {
        __esModule: true,
        default: mockDayjs,
    };
});

jest.mock('antd', () => {
    const originalAntd = jest.requireActual('antd');
    return {
        ...originalAntd,
        message: {
            success: jest.fn(),
            error: jest.fn(),
            warning: jest.fn(),
        },
    };
});