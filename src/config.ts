/**
 * Config file to toggle between Backend API and Direct Supabase (Serverless)
 */
export const APP_CONFIG = {
    /**
     * 💡 HOW TO SWITCH DATA SOURCE:
     * ----------------------------
     * - Change to 'api'      => To use local Express server.
     * - Change to 'supabase' => To use direct Supabase (Serverless).
     */
    DATA_SOURCE: 'api' as 'api' | 'supabase',

    // You can manually toggle this here or make it dynamic based on hostname
    get currentSource() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return this.DATA_SOURCE; // Use what's set above
        }
        // Force supabase on GitHub Pages
        return 'supabase';
    }
};
