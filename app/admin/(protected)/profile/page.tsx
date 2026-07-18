"use client";

import { useState, useRef, useEffect } from "react";
import SectionHeader from "../../components/SectionHeader";
import { useStaffContext } from "@/contexts/StaffContext";
import { InputField } from "@/components/ui/FormComponents";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { ROLE_LABELS, ROLE_COLORS } from "@/types/staff";
import {
  useUpdateProfile,
  useUploadAdminAvatar,
  useChangeAdminPassword,
} from "@/hooks/api/useAdminProfile";
import { isPasswordSecure } from "@/lib/validations";
import PasswordRequirementHint from "@/components/ui/PasswordRequirementHint";
import { fileToBase64 } from "@/utils/fileUtils";
import { AppImage } from "@/components/AppImage";
import { IconButton } from "@/components/ui/buttons";
import { formatDateOnly } from "@/helper/formatter";

type ProfileFormState = {
  firstName: string;
  lastName: string;
  phone: string;
};

const ProfilePage = () => {
  const staff = useStaffContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { firstName, lastName } = staff;
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAdminAvatar();
  const changePassword = useChangeAdminPassword();

  // Profile form state — single object to reduce scattered state
  const [form, setForm] = useState<ProfileFormState>({
    firstName: staff?.firstName ?? "",
    lastName: staff?.lastName ?? "",
    phone: staff?.phone ?? "",
  });

  // Image preview state — preview shown immediately, upload deferred to save
  const [imagePreview, setImagePreview] = useState<string | null>(
    staff?.image?.url ?? null,
  );
  const [pendingImageBase64, setPendingImageBase64] = useState<string | null>(
    null,
  );
  const hasImageChange = pendingImageBase64 !== null;

  // Change password state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Sync form state when staff data changes (e.g. after save)
  useEffect(() => {
    setForm({
      firstName: staff?.firstName ?? "",
      lastName: staff?.lastName ?? "",
      phone: staff?.phone ?? "",
    });
    setImagePreview(staff?.image?.url ?? null);
    setPendingImageBase64(null);
  }, [staff]);

  // Handle file selection — show local preview only, upload deferred to save
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const base64 = await fileToBase64(file);
    setImagePreview(base64);
    setPendingImageBase64(base64);
  };

  // Discard the pending image change and revert preview
  const discardImageChange = () => {
    setPendingImageBase64(null);
    setImagePreview(staff?.image?.url ?? null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let image = undefined;

      // Upload to Cloudinary only when user confirmed a new image
      if (pendingImageBase64) {
        const uploaded = await uploadAvatar.mutateAsync({
          imageFile: pendingImageBase64,
          oldPublicId: staff?.image?.public_id,
        });
        image = { url: uploaded.url, public_id: uploaded.public_id };
        setPendingImageBase64(null);
      }

      await updateProfile.mutateAsync({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        image,
      });
    } catch {
      // Error toasts are handled in the hooks
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!isPasswordSecure(newPassword)) {
      setPasswordError("Password does not meet the security requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      await changePassword.mutateAsync({ newPassword });
      setNewPassword("");
      setConfirmPassword("");
      setShowNew(false);
      setShowConfirm(false);
      setShowPasswordSection(false);
    } catch {
      // Error toasts are handled in the hook
    }
  };

  const passwordValid = isPasswordSecure(newPassword);
  const passwordsMatch = newPassword === confirmPassword;
  const canSubmitPassword =
    passwordValid && passwordsMatch && !changePassword.isPending;

  const isSaving = updateProfile.isPending || uploadAvatar.isPending;

  return (
    <div className="space-y-8">
      <SectionHeader
        title="My Profile"
        subTitle="View and manage your account details"
        icon="Save"
        btnTxt="Save Changes"
        type="submit"
        form="profile-form"
        isLoading={isSaving}
        loadingTxt="Saving..."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/** Left column — Avatar + quick info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-4">
            {/** Avatar with preview-first flow */}
            <div className="relative mx-auto w-28 h-28">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-100 mx-auto">
                <AppImage
                  src={imagePreview ?? ""}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                icon={{ name: "Camera" }}
                className="absolute bottom-0 right-0 rounded-full"
              />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />

            {/** Discard pending image change */}
            {hasImageChange && (
              <IconButton
                onClick={discardImageChange}
                variant="underline"
                text="Discard photo chane"
              />
            )}

            {/** Name + Role */}
            <div>
              <h3 className="text-lg font-bold text-slate-800">{fullName}</h3>
              <span
                className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[staff?.role ?? "cashier"]}`}
              >
                {ROLE_LABELS[staff?.role ?? "cashier"]}
              </span>
            </div>

            {/** Quick info */}
            <div className="space-y-2 text-left border-t border-slate-100 pt-4">
              <div className="flex items-center gap-3 text-sm">
                <DynamicIcon
                  name="Mail"
                  size={16}
                  className="text-slate-400 shrink-0"
                />
                <span className="text-slate-600 truncate">{staff?.email}</span>
              </div>
              {staff?.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <DynamicIcon
                    name="Phone"
                    size={16}
                    className="text-slate-400 shrink-0"
                  />
                  <span className="text-slate-600">{staff.phone}</span>
                </div>
              )}
              {staff?.branch && (
                <div className="flex items-center gap-3 text-sm">
                  <DynamicIcon
                    name="Store"
                    size={16}
                    className="text-slate-400 shrink-0"
                  />
                  <span className="text-slate-600">{staff.branch.name}</span>
                </div>
              )}
              {staff?.createdAt && (
                <div className="flex items-center gap-3 text-sm">
                  <DynamicIcon
                    name="Calendar"
                    size={16}
                    className="text-slate-400 shrink-0"
                  />
                  <span className="text-slate-600">
                    Joined {formatDateOnly(staff.createdAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/** Right column — Editable details */}
        <div className="lg:col-span-2 space-y-6">
          {/** Personal Information */}
          <form id="profile-form" onSubmit={handleSaveProfile}>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  required
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  placeholder="First name"
                  leftIcon={<DynamicIcon name="User" size={18} />}
                />
                <InputField
                  label="Last Name"
                  required
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  placeholder="Last name"
                  leftIcon={<DynamicIcon name="User" size={18} />}
                />
              </div>

              <InputField
                label="Email"
                type="email"
                value={staff?.email ?? ""}
                disabled
                leftIcon={<DynamicIcon name="Mail" size={18} />}
                subLabel="Email cannot be changed"
              />

              <InputField
                label="Phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="+639XXXXXXXXX or 09XXXXXXXXX"
                leftIcon={<DynamicIcon name="Phone" size={18} />}
              />
            </div>
          </form>

          {/** Change Password section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-800">Security</h2>
              {!showPasswordSection && (
                <IconButton
                  onClick={() => setShowPasswordSection(true)}
                  text="Change Password"
                  className="rounded-lg px-4"
                />
              )}
            </div>

            {showPasswordSection ? (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <InputField
                    label="New Password"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter a strong password"
                    leftIcon={<DynamicIcon name="Lock" size={18} />}
                    rightElement={
                      <IconButton
                        onClick={() => setShowNew(!showNew)}
                        variant="ghost"
                        icon={{ name: showNew ? "EyeOff" : "Eye", size: 18 }}
                        className="hover:bg-transparent hover:text-gray-500"
                      />
                    }
                  />
                  <PasswordRequirementHint password={newPassword} />
                </div>

                <InputField
                  label="Confirm New Password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  leftIcon={<DynamicIcon name="Lock" size={18} />}
                  rightElement={
                    <IconButton
                      onClick={() => setShowConfirm(!showConfirm)}
                      variant="ghost"
                      icon={{ name: showConfirm ? "EyeOff" : "Eye", size: 18 }}
                      className="hover:bg-transparent hover:text-gray-500"
                    />
                  }
                  error={
                    confirmPassword && !passwordsMatch
                      ? "Passwords do not match"
                      : undefined
                  }
                />

                {passwordError && (
                  <p className="text-sm text-red-500">{passwordError}</p>
                )}

                <div className="flex gap-3">
                  <IconButton
                    onClick={() => {
                      setShowPasswordSection(false);
                      setNewPassword("");
                      setConfirmPassword("");
                      setPasswordError("");
                    }}
                    variant="outline"
                    text="Cancel"
                    className="rounded-lg px-4"
                  />

                  <IconButton
                    disabled={!canSubmitPassword}
                    variant={canSubmitPassword ? "primary" : "ghost"}
                    icon={{
                      name: changePassword.isPending ? "Loader2" : null,
                      className: "animate-spin",
                    }}
                    text={
                      changePassword.isPending
                        ? "Updating..."
                        : "Update Password"
                    }
                    className={`rounded-lg px-4`}
                  />
                </div>
              </form>
            ) : (
              <p className="text-sm text-slate-500">
                Keep your account secure by using a strong password.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
