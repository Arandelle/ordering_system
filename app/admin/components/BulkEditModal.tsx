"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Modal from "@/components/ui/Modal";
import { Checkbox } from "@/components/ui/FormComponents/Checkbox";
import {
  InputField,
  SelectField,
  ToggleButton,
} from "@/components/ui/FormComponents";
import { IconButton } from "@/components/ui/buttons";
import {
  categories_api,
  subcategories_api,
} from "@/app/admin/(protected)/categories/hooks/api";
import { Category, SubCategory } from "@/types/category";
import {
  BulkUpdatePayload,
  useBulkUpdateProducts,
} from "@/hooks/api/useProducts";

interface BulkEditModalProps {
  selectedIds: string[];
  onClose: () => void;
}

/**
 * Modal for bulk-editing shared attributes across multiple products.
 * Each field has an "apply" checkbox — only checked fields are included in the update.
 */
export default function BulkEditModal({
  selectedIds,
  onClose,
}: BulkEditModalProps) {
  const bulkMutation = useBulkUpdateProducts();

  // ── Which fields to apply ─────────────────────────────────────────────────
  const [applyCategory, setApplyCategory] = useState(false);
  const [applySubcategory, setApplySubcategory] = useState(false);
  const [applyPrice, setApplyPrice] = useState(false);
  const [applyIsActive, setApplyIsActive] = useState(false);
  const [applyIsComingSoon, setApplyIsComingSoon] = useState(false);
  const [applyGoLiveDate, setApplyGoLiveDate] = useState(false);
  const [applyIsOnlineExclusive, setApplyIsOnlineExclusive] = useState(false);
  const [applyIsPopular, setApplyIsPopular] = useState(false);
  const [applyIsSignature, setApplyIsSignature] = useState(false);

  // ── Field values ──────────────────────────────────────────────────────────
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isComingSoon, setIsComingSoon] = useState(false);
  const [goLiveDate, setGoLiveDate] = useState("");
  const [isOnlineExclusive, setIsOnlineExclusive] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [isSignature, setIsSignature] = useState(false);

  // ── Fetch categories ──────────────────────────────────────────────────────
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categories_api.getAll(),
    staleTime: 60_000,
  });

  // ── Fetch subcategories for selected category ─────────────────────────────
  const { data: subcategories = [] } = useQuery({
    queryKey: ["subcategories", categoryId],
    queryFn: () => subcategories_api.getByCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 60_000,
  });

  // Reset subcategory when category changes
  useEffect(() => {
    setSubcategoryId("");
  }, [categoryId]);

  // ── Derive if any field is checked ────────────────────────────────────────
  const hasAnyApply =
    applyCategory ||
    applySubcategory ||
    applyPrice ||
    applyIsActive ||
    applyIsComingSoon ||
    applyGoLiveDate ||
    applyIsOnlineExclusive ||
    applyIsPopular ||
    applyIsSignature;

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!hasAnyApply) return;

    const updates: BulkUpdatePayload["updates"] = {};

    if (applyCategory && categoryId) updates.category = categoryId;
    if (applySubcategory) updates.subcategory = subcategoryId || null;
    if (applyPrice) updates.price = price ? parseFloat(price) : null;
    if (applyIsActive) updates.isActive = isActive;
    if (applyIsComingSoon) updates.isComingSoon = isComingSoon;
    if (applyGoLiveDate) updates.goLiveDate = goLiveDate ? new Date(goLiveDate).toISOString() : null;
    if (applyIsOnlineExclusive) updates.isOnlineExclusive = isOnlineExclusive;
    if (applyIsPopular) updates.isPopular = isPopular;
    if (applyIsSignature) updates.isSignature = isSignature;

    try {
      await bulkMutation.mutateAsync({ ids: selectedIds, updates });
      onClose();
    } catch {
      // toast is handled by the mutation hook
    }
  };

  // ── Category dropdown options ─────────────────────────────────────────────
  const categoryOptions = useMemo(
    () => [
      { label: "Select category…", value: "", disabled: true },
      ...categories.map((cat: Category) => ({
        label: cat.name,
        value: cat._id,
      })),
    ],
    [categories],
  );

  const subcategoryOptions = useMemo(
    () => [
      { label: "No subcategory", value: "" },
      ...subcategories.map((sub: SubCategory) => ({
        label: sub.name,
        value: sub._id,
      })),
    ],
    [subcategories],
  );

  return (
    <Modal
      title="Bulk Edit Products"
      subTitle={`${selectedIds.length} product${selectedIds.length !== 1 ? "s" : ""} selected — check the fields you want to update`}
      onClose={onClose}
      contentClassName="p-6"
    >
      <div className="space-y-4 relative">
        <div className="space-y-2 overflow-y-auto h-full">
          {/* ── Category ─────────────────────────────────────────────── */}
          <div className="flex flex-col items-start gap-4 border border-gray-200 p-4">
            <Checkbox
              checked={applyCategory}
              onChange={() => setApplyCategory((v) => !v)}
              label="Category"
              wrapperClassName="p-1"
            />
            <SelectField
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={categoryOptions}
              disabled={!applyCategory}
              className="rounded-none"
            />
          </div>
          {/* ── Subcategory ──────────────────────────────────────────── */}
          <div className="flex flex-col items-start gap-4  border border-gray-200 p-4">
            <Checkbox
              checked={applySubcategory}
              onChange={() => setApplySubcategory((v) => !v)}
              label="Subcategory"
              wrapperClassName="p-1"
            />
            <SelectField
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              options={subcategoryOptions}
              disabled={!applySubcategory || !categoryId}
              className="rounded-none"
            />
          </div>
          {/* ── Price ────────────────────────────────────────────────── */}
          <div className="flex flex-col items-start gap-4 border border-gray-200 p-4">
            <Checkbox
              checked={applyPrice}
              onChange={() => setApplyPrice((v) => !v)}
              label="Price"
              wrapperClassName="p-1"
            />
            <InputField
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={!applyPrice}
              className="rounded-none"
            />
          </div>
          {/* ── Toggle fields ────────────────────────────────────────── */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pt-2">
            Toggle Flags
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Active */}
            <div className="flex flex-col border border-gray-200 bg-gray-50 p-4 gap-4">
              <Checkbox
                checked={applyIsActive}
                onChange={() => setApplyIsActive((v) => !v)}
                label="Apply Active"
                wrapperClassName="p-1"
              />
              <ToggleButton
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={!applyIsActive}
                label="Active"
              />
            </div>
            {/* Coming Soon */}
            <div className="flex flex-col border border-gray-200 bg-gray-50 p-4 gap-4">
              <Checkbox
                checked={applyIsComingSoon}
                onChange={() => setApplyIsComingSoon((v) => !v)}
                label="Apply Coming Soon"
                wrapperClassName="p-1"
              />
              <ToggleButton
                checked={isComingSoon}
                onCheckedChange={setIsComingSoon}
                disabled={!applyIsComingSoon}
                label="Coming Soon"
              />
            </div>

            {/* Go-Live Date */}
            <div className="flex flex-col border border-gray-200 bg-gray-50 p-4 gap-4">
              <Checkbox
                checked={applyGoLiveDate}
                onChange={() => setApplyGoLiveDate((v) => !v)}
                label="Apply Go-Live Date"
                subLabel="Schedule when the product auto-goes live"
                wrapperClassName="p-1"
              />
              <InputField
                type="date"
                value={goLiveDate}
                onChange={(e) => setGoLiveDate(e.target.value)}
                disabled={!applyGoLiveDate}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Online Exclusive */}
            <div className="flex flex-col border border-gray-200 bg-gray-50 p-4 gap-4">
              <Checkbox
                checked={applyIsOnlineExclusive}
                onChange={() => setApplyIsOnlineExclusive((v) => !v)}
                label="Apply Online Exclusive"
                wrapperClassName="p-1"
              />
              <ToggleButton
                checked={isOnlineExclusive}
                onCheckedChange={setIsOnlineExclusive}
                disabled={!applyIsOnlineExclusive}
                label="Online Exclusive"
              />
            </div>
            {/* Popular */}
            <div className="flex flex-col border border-gray-200 bg-gray-50 p-4 gap-4">
              <Checkbox
                checked={applyIsPopular}
                onChange={() => setApplyIsPopular((v) => !v)}
                label="Apply Popular"
                wrapperClassName="p-1"
              />
              <ToggleButton
                checked={isPopular}
                onCheckedChange={setIsPopular}
                disabled={!applyIsPopular}
                label="Popular"
              />
            </div>
            {/* Signature */}
            <div className="flex flex-col border border-gray-200 bg-gray-50 p-4 gap-4">
              <Checkbox
                checked={applyIsSignature}
                onChange={() => setApplyIsSignature((v) => !v)}
                label="Apply Signature"
                wrapperClassName="p-1"
              />
              <ToggleButton
                checked={isSignature}
                onCheckedChange={setIsSignature}
                disabled={!applyIsSignature}
                label="Signature"
              />
            </div>
          </div>
        </div>

        {/* ── Actions ──────────────────────────────────────────────── */}
        <div className="sticky bottom-0 bg-white flex items-center justify-end gap-3 pt-4 pb-1 border-t border-gray-100">
          <IconButton
            onClick={onClose}
            variant="outline"
            text="Cancel"
            className="py-3 px-6"
          />
          <IconButton
            onClick={handleSubmit}
            disabled={!hasAnyApply || bulkMutation.isPending}
            variant="primary"
            text={bulkMutation.isPending ? "Updating…" : "Apply Changes"}
            icon={
              bulkMutation.isPending
                ? { name: "Loader2", className: "animate-spin" }
                : { name: "Check" }
            }
            className=" px-6 py-3"
          />
        </div>
      </div>
    </Modal>
  );
}
