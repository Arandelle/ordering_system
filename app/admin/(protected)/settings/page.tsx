"use client";

import { InputField } from "@/components/ui/InputField";
import React, { useState } from "react";
import { toast } from "sonner";

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    storeName: "Harrison - Manginasal && BBQ",
    address: "Century Tower Mall, Poblacion Makati City",
    contactNumber: "+63 912 345 6789",
    email: "admin@harrison.com",
    openTime: "10:00",
    closeTime: "22:00",
    taxRate: "12",
    serviceCharge: "5",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Settings saved:", settings);
    toast.success("Successfull saved!")
  };

  return (
    <section className="space-y-6">
      {/**Header */}
      <div>
        <h1 className="text-3xl font-bold text-stone-800 mb-2">Settings</h1>
        <p className="text-stone-500">Manage your restaurant configuration</p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        {/* Store Information */}
        <div className="px-6">
          <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-3">
            Restaurant Information
          </h2>

          <div className="space-y-4">
            <InputField
              label="Store Name"
              id="store-name"
              type="text"
              value={settings.storeName}
              onChange={(e) =>
                setSettings({ ...settings, storeName: e.target.value })
              }
            />

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Address
              </label>
              <textarea
                value={settings.address}
                onChange={(e) =>
                  setSettings({ ...settings, address: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Contact Number"
                id="contact-number"
                type="tel"
                value={settings.contactNumber}
                onChange={(e) =>
                  setSettings({ ...settings, contactNumber: e.target.value })
                }
              />

              <InputField
                label="Email Addresss"
                id="email-address"
                type="email"
                value={settings.email}
                onChange={(e) =>
                  setSettings({ ...settings, email: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-3">
            Business Hours
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Opening Time"
              id="opening-time"
              type="time"
              value={settings.openTime}
              onChange={(e) =>
                setSettings({ ...settings, openTime: e.target.value })
              }
            />
            <InputField
              label="Closing Time"
              id="closing-time"
              type="time"
              value={settings.closeTime}
              onChange={(e) =>
                setSettings({ ...settings, closeTime: e.target.value })
              }
            />
          </div>

          <div className="mt-4 p-4 bg-gray-50">
            <p className="text-sm text-[#ef4501]">
              <span className="font-semibold">Current hours:</span>{" "}
              {settings.openTime} - {settings.closeTime}
            </p>
          </div>
        </div>

        {/* Pricing Configuration */}
        <div className="bg-white px-6">
          <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-3">
            Pricing Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Tax Rate (%)"
              id="tax-rate-input"
              type="number"
              value={settings.taxRate}
              onChange={(e) =>
                setSettings({ ...settings, taxRate: e.target.value })
              }
            />

            <InputField
              label="Service Charge (%)"
              id="service-charge"
              type="number"
              value={settings.serviceCharge}
              onChange={(e) =>
                setSettings({ ...settings, serviceCharge: e.target.value })
              }
            />
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Example calculation:</span> ₱100
              base price + {settings.taxRate}% tax + {settings.serviceCharge}%
              service charge = ₱
              {(
                100 *
                (1 +
                  parseFloat(settings.taxRate) / 100 +
                  parseFloat(settings.serviceCharge) / 100)
              ).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4 px-6">
          <button
            type="button"
            className="px-8 py-3 rounded-xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-100 transition-colors"
          >
            Reset to Default
          </button>
          <button
            type="submit"
            className="flex-1 px-8 py-3 rounded-xl bg-[#ef4501] text-white font-semibold hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            Save Changes
          </button>
        </div>
      </form>
    </section>
  );
};

export default SettingsPage;
