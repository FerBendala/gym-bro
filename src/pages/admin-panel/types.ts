export interface AdminPanelProps {
  isModal?: boolean;
  onClose: () => void;
}

export interface AdminPanelContentProps {
  isModal: boolean;
  isOnline: boolean;
  activeTab: 'exercises' | 'assignments';
  previewUrl: string | null;
  onClose: () => void;
  onTabChange: (tab: 'exercises' | 'assignments') => void;
  onPreviewClose: () => void;
}

export interface AdminPanelHookState {
  isOnline: boolean;
  activeTab: 'exercises' | 'assignments';
  previewUrl: string | null;
  setTab: (tab: 'exercises' | 'assignments') => void;
  setPreviewUrl: (url: string | null) => void;
}
