"use client";

import { InputField } from "@/components/ui/InputField";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useState } from "react";
import { toast } from "sonner";

const LoginPage = () => {
  const route = useRouter();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const response = await fetch("/api/auth/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json();
      return toast.error(data.error || "Failed to login");
    }

    toast.success("Login successfully!");
    route.push("/dashboard");
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap"
        rel="stylesheet"
      />
      <main
        className="grid grid-cols-1 md:grid-cols-3 min-h-screen w-full"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Left panel */}
        <div
          className="hidden md:flex col-span-2 flex-col justify-between p-12 relative overflow-hidden"
          style={{ background: "#0f0f0f" }}
        >
          {/* Grid texture */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          {/* Glow */}
          <div
            className="absolute top-[-80px] left-[-80px] w-[420px] h-[420px] rounded-full opacity-20 blur-[120px]"
            style={{ background: "var(--brand-color, #f97316)" }}
          />
          <div
            className="absolute bottom-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full opacity-10 blur-[100px]"
            style={{ background: "var(--brand-color, #f97316)" }}
          />

          {/* Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ background: "var(--brand-color, #f97316)" }}
              >
                ◈
              </div>
              <span
                className="text-white text-lg font-semibold tracking-tight"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                OrderHub
              </span>
            </div>
          </div>

          {/* Center content */}
          <div className="relative z-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-xs font-medium tracking-widest uppercase"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "var(--brand-color, #f97316)" }}
              />
              Admin Portal
            </div>

            <h1
              className="text-5xl font-extrabold text-white leading-[1.1] mb-6"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Manage your
              <br />
              <span style={{ color: "var(--brand-color, #f97316)" }}>
                operations
              </span>
              <br />
              with ease.
            </h1>
            <p className="text-base max-w-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
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
                <p
                  className="text-sm font-bold mb-0.5"
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    color: "var(--brand-color, #f97316)",
                  }}
                >
                  {s.value}
                </p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex flex-col items-center justify-center w-full px-8 py-12 bg-white">
          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-2 mb-10">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "var(--brand-color, #f97316)" }}
            >
              ◈
            </div>
            <span
              className="text-gray-900 text-base font-semibold"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              OrderHub
            </span>
          </div>

          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h2
                className="text-2xl font-bold text-gray-900 mb-1"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Welcome back
              </h2>
              <p className="text-sm text-gray-400">
                Sign in to your admin account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <InputField
                label="Email address"
                placeholder="you@example.com"
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
              />
              <InputField
                label="Password"
                placeholder="Enter your password"
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white mt-2 transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "var(--brand-color, #f97316)" }}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12" cy="12" r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <p className="text-xs text-center text-gray-300 mt-8">
              © {new Date().getFullYear()} OrderHub. All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default LoginPage;