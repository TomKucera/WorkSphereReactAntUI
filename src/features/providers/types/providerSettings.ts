export interface ProviderSettings {
    max_message_length: number;
    auto_apply_enabled: boolean;
}

export type ProviderSettingsMap = Record<string, ProviderSettings>;