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
    DATA_SOURCE: 'supabase' as 'api' | 'supabase',

    // Automatically detect environment and use appropriate data source
    get currentSource() {
        // Only use DATA_SOURCE setting for localhost development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return this.DATA_SOURCE; // Use what's set above
        }
        // Force supabase for all deployed environments (Vercel, GitHub Pages, etc.)
        return 'supabase';
    }
};
