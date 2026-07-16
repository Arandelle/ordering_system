"use client";

import BrandLogo from "@/components/BrandLogo";
import { InputField } from "@/components/ui/FormComponents";
import { PasswordChangePromptModal } from "@/components/ui/PasswordChangePromptModal";
import { isPasswordSecure } from "@/lib/validations";
import { apiClient } from "@/lib/apiClient";
import { isAllowedAdminDomain } from "@/lib/isAllowedEmails";
import { STAFF_ROLES } from "@/types/staff";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { IconButton } from "@/components/ui/buttons";
import Link from "next/link";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { useSettings } from "@/hooks/api/useSettings";
import packageJson from "@/package.json";

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
  const { data: operationSettings } = useSettings();

  const contact = operationSettings?.contact ?? {};

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
    else if (
      !/\S+@\S+\.\S+$/.test(credentials.email) ||
      !isAllowedAdminDomain(credentials.email)
    )
      error.email = "Enter valid email";

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
      const message =
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.";
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
              Products, Branches, Staff, Inventory, Promotions, Orders, and
              others — all in one place.
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
        <div className="flex flex-col h-full bg-white">
          <div className="flex flex-col flex-1 items-center justify-center px-8 py-12">
            {/* Mobile logo */}
            <div className="lg:hidden mb-10">
              <BrandLogo />
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 w-full max-w-xl"
            >
              <InputField
                label="Email address"
                placeholder="you@emailprovider.com"
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                leftIcon={<DynamicIcon name="Mail" size={14} />}
                error={errors.email}
              />
              <InputField
                label="Password"
                placeholder="Enter your password"
                type={`${showPass ? "text" : "password"}`}
                name="password"
                value={credentials.password}
                onChange={handleChange}
                leftIcon={<DynamicIcon name="Lock" size={14} />}
                rightElement={
                  <IconButton
                    onClick={() => setShowPass(!showPass)}
                    text={showPass ? "Hide" : "Show"}
                    variant="ghost"
                    className="text-xs hover:bg-transparent hover:text-brand-color-500"
                  />
                }
                error={errors.password}
              />
              <IconButton
                type="submit"
                disabled={loading}
                text={loading ? "Signing in..." : "Sign in"}
                icon={{
                  name: loading ? "Loader2" : null,
                  className: "animate-spin",
                }}
                className="p-3 rounded-lg"
              />
              <p className="text-center text-sm text-gray-600">
                By continuing, you agree to our{" "}
                <Link
                  href="/policies/terms-of-use"
                  target="_blank"
                  className="text-brand-color-500 hover:underline"
                >
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link
                  href="/policies/privacy-policy"
                  target="_blank"
                  className="text-brand-color-500 hover:underline"
                >
                  Privacy Policy
                </Link>
              </p>
              <p className="text-xs text-center text-gray-400">
                © {new Date().getFullYear()} House of Inasal & BBQ. All rights
                reserved.
              </p>
            </form>
          </div>

          <div className="max-w-xl w-full flex items-center justify-between mx-auto py-12 px-8">
            <div className="text-start text-sm text-gray-500">
              <p className="text-slate-900 font-semibold">Contact us:</p>
              <p>
                {contact?.email ?? "info@jpfoodlab.com"} -{" "}
                {contact?.phone ?? "09687080780"}
              </p>
            </div>
            <p className="text-slate-900 text-sm">v{packageJson.version}</p>
          </div>
        </div>
      </main>
    </>
  );
};

export default LoginPage;
