import { useEffect, useState, ChangeEvent } from "react";

import type { UserSettings, UserSettingsUpdatePayload } from "@/types/auth";
import { Select, Checkbox } from "@/components/common";
import { useTheme } from "@/contexts/Theme";

interface SettingsFormProps {
  settings: UserSettings | null;
  onSave: (payload: UserSettingsUpdatePayload) => Promise<unknown>;
}

const SettingsForm = ({ settings, onSave }: SettingsFormProps) => {
  const { theme: currentTheme, setTheme } = useTheme();
  const [formState, setFormState] = useState<UserSettingsUpdatePayload>({
    theme: currentTheme,
    language: "vi",
    marketing_emails_enabled: true,
    push_notifications_enabled: true,
    timezone: "Asia/Ho_Chi_Minh",
  });
  const [glassMode, setGlassMode] = useState(false);

  // Load settings from backend when available
  useEffect(() => {
    if (settings) {
      const newFormState = {
        theme: settings.theme,
        language: settings.language,
        marketing_emails_enabled: settings.marketing_emails_enabled,
        push_notifications_enabled: settings.push_notifications_enabled,
        timezone: settings.timezone ?? "Asia/Ho_Chi_Minh",
      };
      setFormState(newFormState);

      // Sync theme with context if different
      if (settings.theme && settings.theme !== currentTheme) {
        setTheme(settings.theme as "light" | "dark" | "system");
        // Also update localStorage to ensure persistence
        localStorage.setItem('theme', settings.theme);
      }
    }
  }, [settings, currentTheme, setTheme]); // Added dependencies

  // Auto-save settings when changed
  const autoSave = async (updatedState: UserSettingsUpdatePayload) => {
    try {
      await onSave({
        theme: updatedState.theme ?? "system",
        language: updatedState.language ?? "vi",
        marketing_emails_enabled: updatedState.marketing_emails_enabled ?? true,
        push_notifications_enabled: updatedState.push_notifications_enabled ?? true,
        timezone: updatedState.timezone?.trim() || null,
      });
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  };

  const handleInput = (field: keyof UserSettingsUpdatePayload) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;

    // Update form state
    const updatedState = { ...formState, [field]: value };
    setFormState(updatedState);

    // If theme is changed, immediately apply it
    if (field === "theme" && typeof value === "string") {
      setTheme(value as "light" | "dark" | "system");
      // Ensure localStorage is updated
      localStorage.setItem('theme', value);
    }

    // Auto-save to backend
    autoSave(updatedState);
  };

  return (
    <div className="space-y-4">
      <Select label="Chủ đề giao diện" value={formState.theme ?? "system"} onChange={handleInput("theme")}>
        <option value="system">Tự động (Theo hệ thống)</option>
        <option value="light">Chế độ sáng</option>
        <option value="dark">Chế độ tối</option>
      </Select>

      <div className="text-xs text-gray-500 dark:text-gray-400 italic">
        Các thay đổi được lưu tự động
      </div>
    </div>
  );
};

export default SettingsForm;
