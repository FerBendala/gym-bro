export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTrigger = 'hover' | 'click';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: TooltipPosition;
  trigger?: TooltipTrigger;
  showIcon?: boolean;
  delay?: number;
  className?: string;
}

export interface InfoTooltipProps {
  content: string;
  position?: TooltipPosition;
  className?: string;
}

export interface TooltipContentProps {
  content: string;
  position: TooltipPosition;
  isVisible: boolean;
}

export interface TooltipTriggerProps {
  children: React.ReactNode;
  showIcon?: boolean;
  className?: string;
}
