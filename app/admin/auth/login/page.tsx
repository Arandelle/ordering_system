"use client";

import BrandLogo from "@/components/BrandLogo";
import { InputField } from "@/components/ui/FormComponents/InputField";
import { PasswordChangePromptModal } from "@/components/ui/PasswordChangePromptModal";
import { isPasswordSecure } from "@/lib/validations";
import { apiClient } from "@/lib/apiClient";
import { ADMIN_EMAIL_DOMAINS, isAllowedAdminDomain } from "@/lib/isAllowedEmails";
import { STAFF_ROLES } from "@/types/staff";
import { Loader2, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useState } from "react";
import { toast } from "sonner";

/** localStorage key to track if the admin has already skipped the password prompt. */
const ADMIN_PASSWORD_PROMPT_SKIPPED_KEY = "admin_password_prompt_skipped";

type CredentialErrors = {
  email?: string;
  password?: string;
};

type AdminLoginRespose = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
};

const LoginPage = () => {
  const route = useRouter();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<CredentialErrors>({});

  // Password change prompt state
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/dashboard");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: undefined,
    }));
  };

  const validate = (): CredentialErrors => {
    const error: CredentialErrors = {};
    if (!credentials.email.trim()) error.email = "Email is required";
    else if (!/\S+@\S+\.\S+$/.test(credentials.email))
      error.email = "Enter valid email";
    else if (!isAllowedAdminDomain(credentials.email))
      error.email = `Only @${ADMIN_EMAIL_DOMAINS.join(" or @")} email addresses are accepted`;
    if (!credentials.password.trim()) error.password = "Password is required!";

    return error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validateErrors = validate();
    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post<AdminLoginRespose>(
        `/auth/admin/login`,
        credentials,
      );

      toast.success("Login successfully!");

      // Determine redirect path
      const path =
        response.user?.role === STAFF_ROLES.CASHIER ? "/orders" : "/dashboard";

      // Check if the entered password meets the new security policy
      // If not, show the password change prompt before redirecting
      if (!isPasswordSecure(credentials.password)) {
        // Check if they've already skipped the prompt on this device
        if (localStorage.getItem(ADMIN_PASSWORD_PROMPT_SKIPPED_KEY)) {
          route.push(path);
        } else {
          setRedirectPath(path);
          setShowPasswordPrompt(true);
        }
      } else {
        route.push(path);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (newPassword: string) => {
    setIsChangingPassword(true);
    try {
      await apiClient.post("/auth/admin/change-password", { newPassword });
      toast.success("Password updated successfully!");
      setShowPasswordPrompt(false);
      localStorage.setItem(ADMIN_PASSWORD_PROMPT_SKIPPED_KEY, "true");
      route.push(redirectPath);
    } catch (err: unknown) {
      throw err instanceof Error ? err : new Error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePasswordPromptSkip = () => {
    setShowPasswordPrompt(false);
    localStorage.setItem(ADMIN_PASSWORD_PROMPT_SKIPPED_KEY, "true");
    route.push(redirectPath);
  };

  return (
    <>
      {/* Password change prompt overlay */}
      {showPasswordPrompt && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handlePasswordPromptSkip}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <PasswordChangePromptModal
              onChangePassword={handlePasswordChange}
              onSkip={handlePasswordPromptSkip}
              loading={isChangingPassword}
            />
          </div>
        </>
      )}

      <main className="grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-brand-color-500/90">
          {/* Logo */}
          <BrandLogo color="white" />

          {/* Center content */}
          <div className="relative z-10">
            <h1 className="text-5xl font-extrabold text-white leading-[1.1] mb-6">
              Manage your
              <br />
              <span className="text-dark-green-600">operations</span>
              <br />
              with ease.
            </h1>
            <p className="text-base max-w-sm text-gray-200">
              Branches, staff, inventory, and orders — all in one place.
            </p>
          </div>

          {/* Bottom stats */}
          <div className="relative z-10 flex gap-8">
            {[
              { value: "Branches", label: "Multi-location support" },
              { value: "Real-time", label: "Order tracking" },
              { value: "Role-based", label: "Staff access" },
            ].map((s) => (
              <div key={s.value}>
                <p className="text-sm font-bold mb-0.5 text-white">{s.value}</p>
                <p className="text-xs text-gray-300">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex flex-col items-center justify-center w-full px-8 py-12 bg-white">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <BrandLogo />
          </div>

          <div className="w-full max-w-xl">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <InputField
                label="Email address"
                placeholder="you@jpfoodlab.com"
                subLabel={`Only @${ADMIN_EMAIL_DOMAINS.join(" or @")} addresses`}
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                leftIcon={<Mail size={14} />}
                error={errors.email}
              />
              <InputField
                label="Password"
                placeholder="Enter your password"
                type={`${showPass ? "text" : "password"}`}
                name="password"
                value={credentials.password}
                onChange={handleChange}
                leftIcon={<Lock size={14} />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="cursor-pointer text-xs hover:text-brand-color-500"
                  >
                    {showPass ? "Hide" : "Show"}
                  </button>
                }
                error={errors.password}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-brand-color-500 hover:bg-brand-color-600 text-white mt-2 transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <p className="text-xs text-center text-gray-400 mt-8">
              © {new Date().getFullYear()} House of Inasal & BBQ. All rights
              reserved.
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default LoginPage;
