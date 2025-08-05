export interface BaseModalConfig<TContent = any> {
  title: string;
  content: TContent;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClose?: () => void;
  onConfirm?: () => void;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}
