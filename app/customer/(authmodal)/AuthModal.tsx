import React, { useMemo, useState } from "react";
import BrandLogo from "../../../components/BrandLogo";
import { MODAL_TYPES, type ModalType } from "@/hooks/utils/useModalQuery";
import Modal from "@/components/ui/Modal";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { apiClient } from "@/lib/apiClient";
import { maskEmail } from "@/helper/maskEmail";
import { trackCompleteRegistration } from "@/lib/metaPixel";
import { mergeGuestCartOnLogin } from "@/contexts/CartContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { VerificationSent } from "./VerificationSent";
import type { AuthMode, LoginFormValues, SignupFormValues } from "./types";
import { IconButton } from "@/components/ui/buttons";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: ModalType;
}

function getAuthMode(mode: ModalType): AuthMode {
  return mode === MODAL_TYPES.SIGNUP ? MODAL_TYPES.SIGNUP : MODAL_TYPES.LOGIN;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(getAuthMode(initialMode));
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmailHint, setVerificationEmailHint] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  // Account deletion/restore state
  const [deletedAccount, setDeletedAccount] = useState<{
    email: string;
    password: string;
    scheduledDeletionAt: string;
  } | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Compute days remaining for restore dialog (memoized to avoid impure render)
  const daysRemaining = useMemo(() => {
    if (!deletedAccount?.scheduledDeletionAt) return null;
    const deletionDate = new Date(deletedAccount.scheduledDeletionAt);
    return Math.max(
      0,
      Math.ceil((deletionDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    );
  }, [deletedAccount?.scheduledDeletionAt]);

  const isLogin = mode === MODAL_TYPES.LOGIN;

  React.useEffect(() => {
    setMode(getAuthMode(initialMode));
  }, [initialMode]);

  React.useEffect(() => {
    if (!isOpen) return;

    if (searchParams.get("signupVerification") === "sent") {
      setVerificationSent(true);
      setVerificationEmailHint(searchParams.get("emailHint") ?? "");
    }
  }, [isOpen, searchParams]);

  const updateModalMode = (nextMode: AuthMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("modal", nextMode);

    setMode(nextMode);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const persistSignupVerificationState = (email: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("modal", MODAL_TYPES.SIGNUP);
    params.set("signupVerification", "sent");
    params.set("emailHint", maskEmail(email));

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const resetModal = () => {
    setVerificationSent(false);
    setVerificationEmailHint("");

    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    params.delete("signupVerification");
    params.delete("emailHint");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const handleGoogleSignIn = async () => {
    setIsSocialLoading(true);
    let socialFailed = false;

    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: "/",
      },
      {
        onError: (ctx) => {
          socialFailed = true;
          toast.error(ctx.error.message || "Google sign in failed");
          setIsSocialLoading(false);
        },
      },
    );

    if (!socialFailed) {
      await mergeGuestCartOnLogin();
    }
  };

  const handleSignup = async (values: SignupFormValues) => {
    setIsLoading(true);

    const normalizedEmail = values.email.trim().toLowerCase();
    const fullName = `${values.firstName.trim()} ${values.lastName.trim()}`;

    await authClient.signUp.email(
      {
        email: normalizedEmail,
        password: values.password,
        name: fullName,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        termsAcceptedAt: values.termsAcceptedAt,
        callbackURL: `/verified?email=${encodeURIComponent(normalizedEmail)}`,
      },
      {
        onSuccess: () => {
          trackCompleteRegistration({ status: "completed" });
          setVerificationEmailHint(maskEmail(normalizedEmail));
          setVerificationSent(true);
          persistSignupVerificationState(normalizedEmail);
          setIsLoading(false);
        },
        onError: (ctx) => {
          const isExistingEmail = ctx.error.message
            ?.toLowerCase()
            .includes("already");
          const message = isExistingEmail
            ? "This email is already registered. Please sign in instead."
            : ctx.error.message || "Failed to create account.";

          toast.error(message);
          setIsLoading(false);
        },
      },
    );
  };

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    let signedIn = false;

    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          signedIn = true;
          onClose();
          setIsLoading(false);
        },
        onError: (ctx) => {
          // Detect soft-deleted account — show restore dialog instead of error
          // Check multiple possible error shapes (Better Auth may wrap differently)
          const errorMessage =
            ctx.error?.message ||
            (ctx.error as Record<string, unknown>)?.error ||
            "";
          if (
            errorMessage === "ACCOUNT_SCHEDULED_FOR_DELETION" ||
            JSON.stringify(ctx.error).includes("ACCOUNT_SCHEDULED_FOR_DELETION")
          ) {
            const deletionError = ctx.error as Record<string, unknown>;
            setDeletedAccount({
              email: values.email,
              password: values.password,
              scheduledDeletionAt:
                (deletionError.scheduledDeletionAt as string) || "",
            });
            setIsLoading(false);
            return;
          }
          toast.error(ctx.error?.message || "Invalid credentials");
          setIsLoading(false);
        },
      },
    );

    if (signedIn) {
      await mergeGuestCartOnLogin();
    }
  };

  // Restore a soft-deleted account and retry login
  const handleRestoreAccount = async () => {
    if (!deletedAccount) return;
    setIsRestoring(true);

    try {
      await apiClient.post("/customer/account/restore", {
        email: deletedAccount.email,
        password: deletedAccount.password,
      });

      toast.success("Account restored! Signing you in...");
      setDeletedAccount(null);

      // Retry sign-in now that the account is restored
      await authClient.signIn.email(
        {
          email: deletedAccount.email,
          password: deletedAccount.password,
        },
        {
          onSuccess: () => {
            onClose();
          },
          onError: () => {
            toast.error("Account restored. Please sign in again.");
          },
        },
      );

      await mergeGuestCartOnLogin();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message ||
            "Failed to restore account";
      toast.error(message);
    } finally {
      setIsRestoring(false);
    }
  };

  if (!isOpen) return null;

  // Restore dialog for soft-deleted accounts
  if (deletedAccount) {
    return (
      <>
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setDeletedAccount(null)}
        />
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4`}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-hidden overflow-y-auto rounded-2xl bg-white shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative space-y-3 bg-amber-600 p-6 text-center">
              <IconButton
                onClick={() => setDeletedAccount(null)}
                icon={{ name: "X", size: 20 }}
                variant="ghost"
                className="absolute right-4 top-4 rounded-lg text-amber-200 hover:bg-amber-400 hover:text-white"
              />

              <div className="flex justify-center">
                <DynamicIcon
                  name="AlertTriangle"
                  size={32}
                  className="text-white"
                />
              </div>
              <h2 className="text-xl font-bold text-white">
                Account Scheduled for Deletion
              </h2>
            </div>

            <div className="space-y-4 p-6">
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <p className="text-sm text-amber-800">
                  Your account is currently scheduled to be permanently deleted.
                  {daysRemaining != null && (
                    <>
                      {" "}
                      You have{" "}
                      <span className="font-bold">
                        {daysRemaining} days
                      </span>{" "}
                      remaining to restore it.
                    </>
                  )}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-gray-800 mb-2">
                  If you restore your account:
                </p>
                <ul className="flex flex-col gap-1.5 text-xs text-gray-600">
                  <li className="flex items-center gap-2">
                    <DynamicIcon
                      name="Check"
                      size={13}
                      className="text-green-500 shrink-0"
                    />
                    All your data will be preserved
                  </li>
                  <li className="flex items-center gap-2">
                    <DynamicIcon
                      name="Check"
                      size={13}
                      className="text-green-500 shrink-0"
                    />
                    You&apos;ll be signed in automatically
                  </li>
                  <li className="flex items-center gap-2">
                    <DynamicIcon
                      name="Check"
                      size={13}
                      className="text-green-500 shrink-0"
                    />
                    Your order history and reviews remain intact
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <IconButton
                  onClick={handleRestoreAccount}
                  disabled={isRestoring}
                  variant="success"
                  icon={{
                    name: isRestoring ? "Looader2" : "Undo",
                    className: isRestoring ? "animate-spin" : "",
                    size: 16,
                  }}
                  text={isRestoring ? "Restoring..." : "Restore My Account"}
                  className="rounded-lg p-3"
                />
                <IconButton
                  onClick={() => setDeletedAccount(null)}
                  disabled={isRestoring}
                  variant="outline"
                  text={"Cancel"}
                  className="rounded-lg p-3"
                />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (verificationSent) {
    return (
      <Modal title="Email Verification" onClose={resetModal}>
        <VerificationSent emailHint={verificationEmailHint} />
      </Modal>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4`}
      >
        <div
          className="max-h-[90vh] w-full max-w-md overflow-hidden overflow-y-auto rounded-2xl bg-white shadow-2xl animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative space-y-3 bg-[#1a1a1a] p-6 text-center">
            <IconButton
              onClick={onClose}
              icon={{ name: "X", size: 20 }}
              variant="ghost"
              className="absolute right-4 top-4"
            />
            <div className="flex justify-center">
              <BrandLogo />
            </div>
            <h2 className="text-xl font-bold text-white">
              {isLogin ? "Welcome Back!" : "Start your story today!"}
            </h2>
          </div>

          <div className="space-y-4 p-6">
            {isLogin ? (
              <LoginForm
                isLoading={isLoading}
                isSocialLoading={isSocialLoading}
                onSubmit={handleLogin}
                onGoogleSignIn={handleGoogleSignIn}
                onSwitchToSignup={() => updateModalMode(MODAL_TYPES.SIGNUP)}
              />
            ) : (
              <SignupForm
                isLoading={isLoading}
                isDisabled={isSocialLoading}
                onSubmit={handleSignup}
                onSwitchToLogin={() => updateModalMode(MODAL_TYPES.LOGIN)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModal;
