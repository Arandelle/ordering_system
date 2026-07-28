"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { TextareaField } from "@/components/ui/FormComponents/TextAreaField";
import { InputField } from "@/components/ui/FormComponents";
import { IconButton } from "@/components/ui/buttons";
import { apiClient } from "@/lib/apiClient";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const RETENTION_DAYS = 30;

/**
 * Confirmation modal for account deletion.
 * Requires the customer to type their email address to confirm.
 * Shows what data will be affected and the 30-day retention window.
 */
export default function DeleteAccountModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const email = session?.user?.email ?? "";

  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [reason, setReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const DELETE_ACCOUNT = [
    { icon: "Check", reason: "You will be signed out immdediately." },
    { icon: "Check", reason: "Your cart will be cleared." },
    {
      icon: "Check",
      reason: "You will not be able to log in during the retention period.",
    },
    {
      icon: "Archive",
      reason:
        "Your order history and reviews are preserved (they contain snapshot data)",
    },
    {
      icon: "Undo",
      reason:
        `You can undo this within ${RETENTION_DAYS} days by restoring your account`,
    },
  ];

  const canSubmit =
    confirmationEmail.trim().toLowerCase() === email.trim().toLowerCase() &&
    !isDeleting;

  const handleDeleteAccount = async (reason: string) => {
    setIsDeleting(true);
    try {
      await apiClient.post("/customer/account/delete", {
        reason: reason || undefined,
      });

      // Clear client-side session cache so useSession() returns null
      await authClient.signOut();

      toast.success("Account scheduled for deletion. You will be signed out.");
      onClose();

      setTimeout(() => {
        router.replace("/");
      }, 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message ||
            "Failed to delete account";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      title="Delete Account"
      subTitle="This action will schedule your account for deletion"
      onClose={onClose}
    >
      <div className="flex flex-col gap-5">
        {/* Warning banner */}
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-4">
          <DynamicIcon
            name="AlertTriangle"
            size={18}
            className="text-red-500 mt-0.5 shrink-0"
          />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Your account will be scheduled for permanent deletion
            </p>
            <p className="text-xs text-red-600 mt-1">
              After {RETENTION_DAYS} days, your account and personal data will
              be permanently moved to our archive and cannot be restored.
            </p>
          </div>
        </div>

        {/* What happens */}
        <div className="bg-gray-50 rounded-xl px-4 py-4">
          <p className="text-sm font-semibold text-gray-800 mb-2">
            What happens when you delete your account:
          </p>
          <ul className="flex flex-col gap-1.5">
            {DELETE_ACCOUNT.map((data, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-xs text-gray-600"
              >
                <DynamicIcon
                  name={data.icon}
                  size={13}
                  className="text-gray-400 mt-0.5 shrink-0"
                />
                {data.reason}
              </li>
            ))}
          </ul>
        </div>

        {/* Reason (optional) */}
        <TextareaField
          label="Reason for leaving (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          maxLength={300}
          placeholder="Help us improve — why are you leaving?"
        />

        {/* Email confirmation */}
        <InputField
          label="Type your email to confirm"
          subLabel={`Type "${email}" to confirm deletion`}
          type="email"
          value={confirmationEmail}
          onChange={(e) => setConfirmationEmail(e.target.value)}
          placeholder={email}
          required
        />

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-2">
          <IconButton
            onClick={onClose}
            disabled={isDeleting}
            variant="outline"
            className="px-4 rounded-lg"
            text="Cancel"
          />
          <IconButton
            onClick={() => handleDeleteAccount(reason)}
            disabled={!canSubmit}
            variant="danger"
            className="px-4 rounded-lg"
            icon={{
              name: isDeleting ? "Loader2" : "Trash2",
              className: isDeleting ? "animate-spin" : "",
            }}
            text={isDeleting ? "Deleting..." : "Delete My Account"}
          />
        </div>
      </div>
    </Modal>
  );
}
