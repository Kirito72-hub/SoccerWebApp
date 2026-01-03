// Type declarations for build-time injected variables
declare const __BUILD_TIMESTAMP__: string;
declare const __APP_VERSION__: string;

// Make them available globally
interface Window {
    __BUILD_TIMESTAMP__: string;
    __APP_VERSION__: string;
}
