"use client";

import React, { useState, useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { DynamicIcon } from "@/lib/DynamicIcon";
import { toast } from "sonner";
import { syne } from "@/app/font";
import Link from "next/link";
import { useMyAddress, useUpdateAddress } from "../hooks/useMyAddress";
import LoadingPage from "@/components/ui/LoadingPage";
import { InputField } from "@/components/ui/InputField";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "personal" | "address" | "security";

interface PersonalForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface AddressForm {
  line1: string;
  line2: string;
  city: string;
  province: string;
  zipCode: string;
  country: string;
  landmark: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const SectionCard = ({
  children,
  title,
  subtitle,
  icon,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon: string;
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
      <div className="w-9 h-9 bg-brand-color-100 rounded-xl flex items-center justify-center">
        <DynamicIcon
          name={icon as any}
          size={18}
          className="text-brand-color-500"
        />
      </div>
      <div>
        <h3 className={`${syne.className} font-bold text-gray-900 text-base`}>
          {title}
        </h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// ─── Tab: Personal Info ───────────────────────────────────────────────────────

const PersonalTab = ({ session }: { session: any }) => {
  const [form, setForm] = useState<PersonalForm>({
    firstName: session?.user?.firstName ?? "",
    lastName: session?.user?.lastName ?? "",
    email: session?.user?.email ?? "",
    phone: session?.user?.phone ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await authClient.updateUser({
        firstName: form.firstName,
        lastName: form.lastName,
        name: `${form.firstName} ${form.lastName}`.trim(),
        phone: form.phone,
      });
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const initials =
    `${form.firstName?.[0] ?? ""}${form.lastName?.[0] ?? ""}`.toUpperCase() ||
    session?.user?.name?.[0]?.toUpperCase() ||
    "?";

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
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt="Avatar"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-brand-color-100 flex items-center justify-center border-2 border-brand-color-200">
                <span
                  className={`${syne.className} text-2xl font-bold text-brand-color-500`}
                >
                  {initials}
                </span>
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-2 -right-2 w-7 h-7 bg-brand-color-500 hover:bg-brand-color-600 text-white rounded-lg flex items-center justify-center transition-colors shadow-md cursor-pointer"
            >
              {uploadingAvatar ? (
                <DynamicIcon
                  name="Loader2"
                  size={12}
                  className="animate-spin"
                />
              ) : (
                <DynamicIcon name="Pencil" size={12} />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
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
            placeholder="+63 9XX XXX XXXX"
            leftIcon={<DynamicIcon name="Phone" />}
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
          <button
            onClick={handleSave}
            disabled={saving}
            className={`${syne.className} flex items-center gap-2 bg-brand-color-500 hover:bg-brand-color-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60 cursor-pointer`}
          >
            {saving ? (
              <DynamicIcon name="Loader2" size={15} className="animate-spin" />
            ) : (
              <DynamicIcon name="Save" size={15} />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </SectionCard>
    </div>
  );
};

// ─── Tab: Address ─────────────────────────────────────────────────────────────

const PROVINCES = [
  "Metro Manila",
  "Cebu",
  "Davao del Sur",
  "Rizal",
  "Bulacan",
  "Cavite",
  "Laguna",
  "Pampanga",
  "Batangas",
  "Iloilo",
];

const AddressTab = ({ session }: { session: any }) => {
  const updateAddress = useUpdateAddress();
  const { data: myAddress, isPending } = useMyAddress();

  const [form, setForm] = useState<AddressForm>({
    line1: "",
    line2: "",
    city: "",
    province: "",
    zipCode: "",
    country: "Philippines",
    landmark: "",
  });
  const [saving, setSaving] = useState(false);

  // Load existing address on mount
  useEffect(() => {
    if (myAddress?.shippingAddress) {
      setForm(myAddress.shippingAddress);
    }
  }, [myAddress]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAddress.mutateAsync({ address: form });
    } catch (error) {
      console.error("Address save error:", error); // ← see full error in console
      toast.error(error instanceof Error ? error.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (isPending) {
    return <LoadingPage />;
  }

  return (
    <SectionCard
      title="Shipping Address"
      subtitle="Default address for deliveries and orders"
      icon="MapPin"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <InputField
            label="Address Line 1"
            name="line1"
            value={form.line1}
            onChange={handleChange}
            placeholder="House/Unit No., Street Name, Barangay"
            leftIcon={<DynamicIcon name="Home" />}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <InputField
            label="Address Line 2"
            name="line2"
            value={form.line2}
            onChange={handleChange}
            placeholder="Building, Floor, Suite (optional)"
            leftIcon={<DynamicIcon name="Building" />}
          />
        </div>
        <InputField
          label="City / Municipality"
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="Quezon City"
          leftIcon={<DynamicIcon name="MapPin" />}
          required
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            Province <span className="text-brand-color-500">*</span>
          </label>
          <select
            name="province"
            value={form.province}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-color-400 focus:border-transparent transition-all"
          >
            <option value="">Select province</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <InputField
          label="ZIP Code"
          name="zipCode"
          value={form.zipCode}
          onChange={handleChange}
          placeholder="1100"
          leftIcon={<DynamicIcon name="Hash" />}
          required
        />
        <InputField
          label="Country"
          name="country"
          value={form.country}
          onChange={handleChange}
          leftIcon={<DynamicIcon name="Globe" />}
          disabled
        />
        <div className="sm:col-span-2">
          <InputField
            label="Landmark"
            name="landmark"
            value={form.landmark}
            onChange={handleChange}
            placeholder="Near SM, beside the church, etc."
            leftIcon={<DynamicIcon name="Navigation" />}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`${syne.className} flex items-center gap-2 bg-brand-color-500 hover:bg-brand-color-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60 cursor-pointer`}
        >
          {saving ? (
            <DynamicIcon name="Loader2" size={15} className="animate-spin" />
          ) : (
            <DynamicIcon name="Save" size={15} />
          )}
          {saving ? "Saving..." : "Save Address"}
        </button>
      </div>
    </SectionCard>
  );
};

// ─── Tab: Security ────────────────────────────────────────────────────────────

interface PasswordInputProps {
  label: string;
  name: keyof PasswordForm;
  showKey: keyof typeof initialShow;
  placeholder?: string;
  value: string;
  show: boolean;
  onToggleShow: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const initialShow = { current: false, new: false, confirm: false };

const PasswordInput = ({
  label,
  name,
  value,
  show,
  onToggleShow,
  onChange,
  placeholder,
  disabled,
}: PasswordInputProps) => (
  <InputField
    label={label}
    type={show ? "text" : "password"}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder ?? "••••••••"}
    disabled={disabled}
    leftIcon={<DynamicIcon name="Lock" />}
    rightElement={
      <button type="button" onClick={onToggleShow}>
        <DynamicIcon name={show ? "EyeOff" : "Eye"} size={15} />
      </button>
    }
  />
);

const SecurityTab = ({ session }: { session: any }) => {
  const [form, setForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState(initialShow);
  const [saving, setSaving] = useState(false);

  const isOAuthOnly =
    session?.user?.accounts?.some((a: any) => a.provider === "google") &&
    !session?.user?.hasPassword;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const passwordStrength = (pw: string) => {
    if (!pw) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const levels = [
      { label: "Weak", color: "bg-red-400" },
      { label: "Fair", color: "bg-amber-400" },
      { label: "Good", color: "bg-yellow-400" },
      { label: "Strong", color: "bg-green-400" },
      { label: "Very strong", color: "bg-emerald-500" },
    ];
    return { score, ...levels[score] };
  };

  const strength = passwordStrength(form.newPassword);

const handleSave = async () => {
  if (form.newPassword !== form.confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }
  if (form.newPassword.length < 8) {
    toast.error("Password must be at least 8 characters");
    return;
  }

  setSaving(true);
  try {
    const { error } = await authClient.changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
      revokeOtherSessions: true,
    });

    if (error) {
      toast.error(error.message || "Failed to update password");
      return;
    }

    toast.success("Password updated successfully");
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  } catch (err: any) {
    toast.error(err?.message || "Failed to update password");
  } finally {
    setSaving(false);
  }
};
  return (
    <div className="flex flex-col gap-6">
      <SectionCard
        title="Change Password"
        subtitle="Keep your account secure"
        icon="Lock"
      >
        {isOAuthOnly ? (
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-4">
            <DynamicIcon
              name="Info"
              size={16}
              className="text-blue-500 mt-0.5 shrink-0"
            />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Google account detected
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                You signed in with Google. Password management is handled by
                your Google account.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <PasswordInput
              label="Current Password"
              name="currentPassword"
              showKey="current"
              value={form.currentPassword} // ← pass value explicitly
              show={show.current} // ← pass just the boolean
              onToggleShow={() =>
                setShow((s) => ({ ...s, current: !s.current }))
              }
              onChange={handleChange} // ← pass directly, no arrow wrapper
              placeholder="Enter current password"
            />
            <PasswordInput
              label="New Password"
              name="newPassword"
              showKey="new"
              value={form.newPassword}
              show={show.new}
              onToggleShow={() => setShow((s) => ({ ...s, new: !s.new }))}
              onChange={handleChange}
              placeholder="At least 8 characters"
            />
            {/* Strength bar */}
            {form.newPassword && (
              <div className="flex flex-col gap-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength.score ? strength.color : "bg-gray-100"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500">{strength.label}</p>
              </div>
            )}

            <PasswordInput
              label="Confirm New Password"
              name="confirmPassword"
              showKey="confirm"
              value={form.confirmPassword}
              show={show.confirm}
              onToggleShow={() =>
                setShow((s) => ({ ...s, confirm: !s.confirm }))
              }
              onChange={handleChange}
              placeholder="Re-enter new password"
            />

            {form.confirmPassword &&
              form.newPassword !== form.confirmPassword && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <DynamicIcon name="AlertCircle" size={12} />
                  Passwords do not match
                </p>
              )}

            <div className="flex justify-end mt-2">
              <button
                onClick={handleSave}
                disabled={
                  saving ||
                  !form.currentPassword ||
                  !form.newPassword ||
                  !form.confirmPassword
                }
                className={`${syne.className} flex items-center gap-2 bg-brand-color-500 hover:bg-brand-color-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60 cursor-pointer`}
              >
                {saving ? (
                  <DynamicIcon
                    name="Loader2"
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <DynamicIcon name="ShieldCheck" size={15} />
                )}
                {saving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Danger zone */}
      <SectionCard
        title="Danger Zone"
        subtitle="Irreversible account actions"
        icon="AlertTriangle"
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-medium text-gray-800">Delete Account</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Permanently delete your account and all associated data. This
              cannot be undone.
            </p>
          </div>
          <button className="flex items-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer">
            <DynamicIcon name="Trash2" size={14} />
            Delete Account
          </button>
        </div>
      </SectionCard>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "personal", label: "Personal Info", icon: "User" },
  { id: "address", label: "Address", icon: "MapPin" },
  { id: "security", label: "Security", icon: "Lock" },
];

const ProfilePage = () => {
  const { data: session, isPending } = authClient.useSession();
  const [activeTab, setActiveTab] = useState<Tab>("personal");

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <DynamicIcon
            name="Loader2"
            size={32}
            className="animate-spin text-brand-color-500"
          />
          <p className="text-sm text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">
            You must be logged in to view this page.
          </p>
          <Link
            href="/"
            className="text-brand-color-500 hover:underline text-sm mt-2 block"
          >
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-3">
          <Link
            href="/"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
          >
            <DynamicIcon name="ArrowLeft" size={18} />
          </Link>
          <div>
            <h1 className={`${syne.className} text-xl font-bold text-gray-900`}>
              My Profile
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Tab Bar */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 shadow-sm mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-brand-color-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <DynamicIcon name={tab.icon as any} size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "personal" && <PersonalTab session={session} />}
        {activeTab === "address" && <AddressTab session={session} />}
        {activeTab === "security" && <SecurityTab session={session} />}
      </div>
    </div>
  );
};

export default ProfilePage;
