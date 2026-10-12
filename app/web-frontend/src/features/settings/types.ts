export type SettingsTab = "general" | "profile" | "security";

export interface SettingsTabConfig {
  id: SettingsTab;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export interface SettingsState {
  isOAuth: boolean;
  isSaving: boolean;
  saveMessage: string;
}
