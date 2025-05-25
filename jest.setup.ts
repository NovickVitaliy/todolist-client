// jest.setup.ts
import '@testing-library/jest-dom';

// Mock dayjs for rc-picker and antd
jest.mock('dayjs', () => {
    const originalDayjs = jest.requireActual('dayjs');
    const mockDayjs = jest.fn((...args) => {
        const instance = originalDayjs(...args);
        instance.extend = jest.fn(); // Mock extend method
        instance.format = jest.fn().mockReturnValue('2023-01-01'); // Mock format for consistency
        instance.isValid = jest.fn().mockReturnValue(true); // Mock isValid
        return instance;
    });
    mockDayjs.extend = jest.fn(); // Mock static extend method
    mockDayjs.utc = jest.fn().mockImplementation((...args) => originalDayjs(...args)); // Mock utc plugin
    return {
        __esModule: true,
        default: mockDayjs,
    };
});

// Mock Ant Design's message (if used)
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