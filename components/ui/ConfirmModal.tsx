"use client";

import Modal from "@/components/ui/Modal";
import { IconButton } from "@/components/ui/buttons";

interface Props {
  /** Title shown in the modal header */
  title: string;
  /** Subtitle or description below the title */
  subTitle?: string;
  /** Body message displayed in the modal content */
  message: string;
  /** Label for the confirm button */
  confirmLabel: string;
  /** Tailwind class for the confirm button styling */
  confirmVariant?: string;
  /** Whether the confirm action is in progress */
  isLoading: boolean;
  /** Called when the user dismisses the modal */
  onClose: () => void;
  /** Called when the user confirms the action */
  onConfirm: () => void;
}

/**
 * Lightweight confirmation modal for irreversible actions that
 * don't require a reason (e.g., Dispatch, Mark Completed).
 * For actions needing a reason (Cancel, Expire), use ConfirmationWithReasonModal.
 */
export default function ConfirmModal({
  title,
  subTitle,
  message,
  confirmLabel,
  confirmVariant = "bg-amber-500 hover:bg-amber-600",
  isLoading,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal onClose={onClose} title={title} subTitle={subTitle} className="text-start normal-case">
      <div className="flex flex-col gap-5">
        <p className="text-lg text-gray-600">
          {message}
        </p>

        <div className="flex gap-2 justify-end">
          <IconButton
            onClick={onClose}
            variant="outline"
            text="Back"
            className="rounded-lg px-4"
          />
          <IconButton
            onClick={onConfirm}
            disabled={isLoading}
            isLoading={isLoading}
            text={isLoading ? "Processing..." : confirmLabel}
            className={`rounded-lg px-4 ${confirmVariant}`}
          />
        </div>
      </div>
    </Modal>
  );
}
