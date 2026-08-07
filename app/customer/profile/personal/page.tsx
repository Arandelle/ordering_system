"use client";

import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { SectionCard } from "../component/SectionCard";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { InputField } from "@/components/ui/FormComponents/InputField";
import { authClient } from "@/lib/auth-client";
import { apiClient } from "@/lib/apiClient";
import { fileToBase64 } from "@/utils/fileUtils";
import { ImagePreviewModal } from "@/components/ImagePreviewModal";
import { IconButton } from "@/components/ui/buttons";
import { AppImage } from "@/components/AppImage";

interface PersonalForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// ─── Validation helpers ──────────────────────────────────────────────────────

const PHONE_REGEX = /^(09|\+639)\d{9}$/;
const PHONE_MAX_LENGTH = 13; // +639XXXXXXXXX = 13 chars

const validatePhone = (phone: string): string | undefined => {
  if (!phone) return undefined; // phone is optional
  if (!PHONE_REGEX.test(phone)) {
    return "Invalid phone. Use 09XXXXXXXXX or +639XXXXXXXXX";
  }
  return undefined;
};

// ─── Tab: Personal Info ───────────────────────────────────────────────────────

const PersonalTab = () => {
  const { data: session, isPending } = authClient.useSession();

  const [form, setForm] = useState<PersonalForm>({
    firstName: session?.user?.firstName ?? "",
    lastName: session?.user?.lastName ?? "",
    email: session?.user?.email ?? "",
    phone: session?.user?.phone ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [phoneError, setPhoneError] = useState<string | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Enforce phone max length - but allow editing existing longer values
    // (handles cases where existing data exceeds limits due to pre-validation saves)
    if (
      name === "phone" &&
      value.length > PHONE_MAX_LENGTH &&
      value.length >= form.phone.length
    ) {
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear phone error when user types
    if (name === "phone") {
      setPhoneError(undefined);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageData = await fileToBase64(file);
    setPreview(imageData);
  };

  const handleAvatarUpload = async () => {
    if (!preview) return;
    setUploadingAvatar(true);
    try {
      const { secure_url, public_id } = await apiClient.post<{
        secure_url: string;
        public_id: string;
      }>("/customer/upload-avatar", {
        imageFile: preview,
        oldPublicId: session?.user?.publicId ?? undefined,
      });

      await authClient.updateUser({ image: secure_url, publicId: public_id });
      setPreview(null);
      toast.success("Avatar updated!");
    } catch {
      toast.error("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    // Validate phone before saving
    const phoneValidationError = validatePhone(form.phone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      toast.error(phoneValidationError);
      return;
    }

    setSaving(true);
    try {
      // Better Auth returns errors in response object, not as thrown exceptions
      const { error } = await authClient.updateUser({
        firstName: form.firstName,
        lastName: form.lastName,
        name: `${form.firstName} ${form.lastName}`.trim(),
        phone: form.phone,
      });

      if (error) {
        toast.error(error.message || "Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      // Catch network errors or unexpected exceptions
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile",
      );
    } finally {
      setSaving(false);
    }
  };

  const initials =
    `${form.firstName?.[0] ?? ""}${form.lastName?.[0] ?? ""}`.toUpperCase() ||
    session?.user?.name?.[0]?.toUpperCase() ||
    "?";

  if (isPending) {
    return (
      <SectionCard
        title="Basic Information"
        subtitle="Your personal details"
        icon="User"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
          <div className="sm:col-span-2 h-10 bg-gray-100 rounded-xl" />

          <div className="sm:col-span-2 h-10 bg-gray-100 rounded-xl" />

          <div className="h-10 bg-gray-100 rounded-xl" />
          <div className="h-10 bg-gray-100 rounded-xl" />

          <div className="h-10 bg-gray-100 rounded-xl" />
          <div className="h-10 bg-gray-100 rounded-xl" />

          <div className="sm:col-span-2 h-10 bg-gray-100 rounded-xl" />
        </div>

        <div className="mt-6 flex justify-end">
          <div className="h-10 w-36 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </SectionCard>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Avatar */}
      <SectionCard
        title="Profile Photo"
        subtitle="Update your profile picture"
        icon="Camera"
      >
        <div className="flex items-center gap-5">
          <div className="relative">
            {(preview ?? session?.user?.image) ? (
              <AppImage
                src={preview || session?.user?.image || ""}
                alt="Avatar"
                className="cursor-pointer w-20 h-20 rounded-2xl object-cover border-2 border-gray-100"
                onClick={() => setShowPreview(true)}
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-brand-color-100 flex items-center justify-center border-2 border-brand-color-200">
                <span className="text-2xl font-bold text-brand-color-500">
                  {initials}
                </span>
              </div>
            )}

            <IconButton
              className="absolute top-2 left-2 hover:bg-transparent p-0"
              onClick={() => setShowPreview(true)}
              icon={{ name: "Maximize2", size: 12 }}
              variant="ghost"
            />

            <IconButton
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              isLoading={uploadingAvatar}
              icon={{ name: "Pencil", size: 12 }}
              className="rounded-lg absolute -bottom-2 -right-2"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800">
              {session?.user?.name || "Your Name"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {session?.user?.email}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG or GIF · Max 2MB
            </p>

            {/* Show upload button only when preview is pending */}
            {preview && (
              <button
                onClick={handleAvatarUpload}
                disabled={uploadingAvatar}
                className="mt-2 flex items-center gap-1.5 bg-brand-color-500 hover:bg-brand-color-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
              >
                {uploadingAvatar ? (
                  <DynamicIcon
                    name="Loader2"
                    size={12}
                    className="animate-spin"
                  />
                ) : (
                  <DynamicIcon name="Upload" size={12} />
                )}
                {uploadingAvatar ? "Uploading..." : "Upload Photo"}
              </button>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Basic Info */}
      <SectionCard
        title="Basic Information"
        subtitle="Your personal details"
        icon="User"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="First Name"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="Juan"
            leftIcon={<DynamicIcon name="User" />}
            required
          />
          <InputField
            label="Last Name"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="dela Cruz"
            leftIcon={<DynamicIcon name="User" />}
            required
          />
          <InputField
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="juan@example.com"
            leftIcon={<DynamicIcon name="Mail" />}
            disabled
          />
          <InputField
            label="Phone Number"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="09XXXXXXXXX or +639XXXXXXXXX"
            leftIcon={<DynamicIcon name="Phone" />}
            maxLength={PHONE_MAX_LENGTH}
            error={phoneError}
          />
        </div>

        {/* Email notice */}
        <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <DynamicIcon
            name="Info"
            size={14}
            className="text-amber-500 mt-0.5 shrink-0"
          />
          <p className="text-xs text-amber-700">
            Email address cannot be changed here. Contact support if you need to
            update it.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <IconButton
            onClick={handleSave}
            disabled={saving}
            isLoading={saving}
            icon={{ name: "Save", size: 15 }}
            text="Save Changes"
            loadingText="Saving..."
            className="px-3 rounded-lg"
          />
        </div>
      </SectionCard>

      {showPreview && (
        <ImagePreviewModal
          src={preview || session?.user?.image || ""}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default PersonalTab;
