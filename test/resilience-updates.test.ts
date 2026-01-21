/**
 * Test file for the updated resilience system
 */

import DymoAPI from '../src/dymo-api';

// Mock tests for resilience system updates
describe('Resilience System Updates', () => {
    let dymoAPI: DymoAPI;

    beforeEach(() => {
        dymoAPI = new DymoAPI({
            apiKey: 'test-api-key',
            resilience: {
                fallbackEnabled: true,
                retryAttempts: 2, // 1 normal + 2 retries = 3 total
                retryDelay: 100
            }
        });
    });

    test('should initialize with correct retry configuration', () => {
        const config = dymoAPI['resilienceManager'].getConfig();
        expect(config.retryAttempts).toBe(2); // Additional retries
        expect(config.fallbackEnabled).toBe(true);
        expect(config.retryDelay).toBe(100);
    });

    test('should have correct client ID', () => {
        const clientId = dymoAPI['resilienceManager'].getClientId();
        expect(clientId).toBe('test-api-key');
    });

    test('should handle anonymous client when no API key provided', () => {
        const anonymousAPI = new DymoAPI({
            resilience: {
                fallbackEnabled: true,
                retryAttempts: 1
            }
        });
        
        const clientId = anonymousAPI['resilienceManager'].getClientId();
        expect(clientId).toBe('anonymous');
    });

    test('should use root API key as client ID when API key is missing', () => {
        const rootAPI = new DymoAPI({
            rootApiKey: 'root-key-123',
            resilience: {
                fallbackEnabled: true,
                retryAttempts: 1
            }
        });
        
        const clientId = rootAPI['resilienceManager'].getClientId();
        expect(clientId).toBe('root-key-123');
    });

    test('should handle zero retry attempts', () => {
        const noRetryAPI = new DymoAPI({
            apiKey: 'test-api-key',
            resilience: {
                retryAttempts: 0 // Only normal attempt, no retries
            }
        });
        
        const config = noRetryAPI['resilienceManager'].getConfig();
        expect(config.retryAttempts).toBe(0);
    });

    test('should handle negative retry attempts', () => {
        const negativeRetryAPI = new DymoAPI({
            apiKey: 'test-api-key',
            resilience: {
                retryAttempts: -5 // Should be normalized to 0
            }
        });
        
        const config = negativeRetryAPI['resilienceManager'].getConfig();
        expect(config.retryAttempts).toBe(0);
    });
});