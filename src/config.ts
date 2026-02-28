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

    // Automatically detect environment and use appropriate data source
    get currentSource() {
        // Force API for all environments to use backend 'cohub'
        return 'api';
    }
};
