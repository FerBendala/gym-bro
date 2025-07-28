import { AdminPanel } from '../../admin-panel';

interface AdminModalProps {
  show: boolean;
  onClose: () => void;
}

export const AdminModal = ({ show, onClose }: AdminModalProps) => {
  if (!show) return null;

  return (
    <AdminPanel
      isModal={true}
      onClose={onClose}
    />
  );
}; 