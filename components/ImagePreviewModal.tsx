import { DynamicIcon } from "@/lib/DynamicIcon";

interface ImagePreviewModalProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export const ImagePreviewModal = ({ src, alt = "Preview", onClose }: ImagePreviewModalProps) => (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black/80 z-50"
    onClick={onClose}
  >
    <div
      className="relative p-2 bg-white rounded-2xl max-h-[90vh] max-w-[90vw]"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute -top-3 -right-3 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <DynamicIcon name="X" size={14} />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-h-[85vh] max-w-full object-contain rounded-xl"
      />
    </div>
  </div>
);