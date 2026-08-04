"use client";

import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  InputField,
  TextareaField,
  ToggleButton,
} from "@/components/ui/FormComponents";
import { useCreateProduct, useUpdateProduct } from "@/hooks/api/useProducts";
import { toast } from "sonner";
import {
  ModifierGroupUI,
  ITEM_TYPES,
  ProductType,
  Product,
} from "@/types/products";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { useRouter } from "next/navigation";
import { categories_api, subcategories_api } from "../categories/hooks/api";
import { fileToBase64 } from "@/utils/fileUtils";
import { AppImage } from "@/components/AppImage";
import { ProductSectionCard } from "./components/ProductSectionCard";
import { TaxBreakdown } from "./components/TaxBreakdown";
import VisibilityToggles from "./components/VisibilityToggles";
import SectionHeader from "../../components/SectionHeader";
import ImageSection, { ImageSelectionState } from "./components/ImageSection";
import CategorySection, {
  CategorySelectionState,
} from "./components/CategorySection";
import ModifierGroupsSection from "./components/ModifierGroupsSection";
import ComboPricePreview from "./components/ComboPricePreview";
import GroupReorderPanel from "./components/GroupReorderPanel";
import { formatDateInputValue, toTimeInputValue } from "@/helper/formatter";
import { IconButton } from "@/components/ui/buttons";

// Products older than 30 days cannot be reverted to "coming soon"
const COMING_SOON_AGE_LIMIT_MS = 30 * 24 * 60 * 60 * 1000;

interface ProductFormData {
  name: string;
  price: string;
  info: string;
  description: string;
  isSignature: boolean;
  isPopular: boolean;
  isActive: boolean;
  isComingSoon: boolean;
  isOnlineExclusive: boolean;
  goLiveDate: string;
  goLiveTime: string;
  productType: ProductType;
  paxCount: string;
}

export interface ProductFormPageProps {
  editProduct?: Product | null;
}

export const PRODUCT_TYPE_OPTIONS: {
  value: ProductType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: ITEM_TYPES.SOLO,
    label: "Solo",
    description: "Single ala-carte item",
    icon: <DynamicIcon name="Utensils" size={16} />,
  },
  {
    value: ITEM_TYPES.COMBO,
    label: "Combo",
    description: "Bundled meal with drink",
    icon: <DynamicIcon name="Package" size={16} />,
  },
  {
    value: "set",
    label: "Set",
    description: "Group / sharing platter",
    icon: <DynamicIcon name="Star" size={16} />,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const ProductFormPage = ({ editProduct = null }: ProductFormPageProps) => {
  const router = useRouter();
  const isEditMode = !!editProduct;

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  // ── Form state ──────────────────────────────────────────────────────────────

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "",
    info: "",
    description: "",
    isSignature: false,
    isPopular: false,
    isActive: true,
    isComingSoon: false,
    isOnlineExclusive: false,
    goLiveDate: "",
    goLiveTime: "00:00",
    productType: ITEM_TYPES.SOLO,
    paxCount: "",
  });

  // ── Image selection state (tracked from ImageSection) ────────────────────────

  const [imageSelection, setImageSelection] = useState<ImageSelectionState>({
    activeTab: "upload",
    imageFile: null,
    imageUrl: "",
    galleryUrl: null,
  });

  // ── Category selection state (tracked from CategorySection) ──────────────────

  const [categorySelection, setCategorySelection] =
    useState<CategorySelectionState>({
      categoryId: "",
      subcategoryId: "",
      showCustomCategory: false,
      customCategory: "",
      showCustomSubcategory: false,
      customSubcategory: "",
      categories: [],
    });

  // ── Modifier groups state (tracked from ModifierGroupsSection) ───────────────

  const [modifierGroupsState, setModifierGroupsState] = useState<
    ModifierGroupUI[]
  >([]);

  // Group display order for the right-column reorder panel — array of original indices.
  // Only used when product is combo/set and has 2+ groups.
  const [groupOrder, setGroupOrder] = useState<number[]>([]);

  // ── Derived ─────────────────────────────────────────────────────────────────

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const isSuccess = createMutation.isSuccess || updateMutation.isSuccess;
  const isComboOrSet = formData.productType !== ITEM_TYPES.SOLO;

  // Products older than 30 days cannot be set to coming soon
  // eslint-disable-next-line react-hooks/purity -- deterministic for a given product
  const isProductTooOldForComingSoon = (() => {
    if (!isEditMode || editProduct?.createdAt == null) return false;
    const createdMs = new Date(editProduct.createdAt).getTime();
    if (isNaN(createdMs)) return false;
    return Date.now() - createdMs > COMING_SOON_AGE_LIMIT_MS;
  })();

  const previewUrl = imageSelection.imageFile
    ? URL.createObjectURL(imageSelection.imageFile)
    : imageSelection.galleryUrl || imageSelection.imageUrl || null;

  // ── Init edit mode ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (editProduct) {
      // Map modifierGroups from editProduct, populating display-only fields
      const modifierGroups =
        editProduct.modifierGroups?.map((group) => {
          const items =
            group.items?.flatMap((item) => {
              const includedProduct =
                item.product && typeof item.product === "object"
                  ? item.product
                  : null;
              const productId =
                typeof item.product === "string"
                  ? item.product
                  : (includedProduct?._id ?? "");

              if (!productId) return [];

              return {
                product: productId,
                label: item.label,
                price: item.price ?? includedProduct?.price ?? null,
                snapshotName:
                  item.snapshotName ||
                  item.label ||
                  includedProduct?.name ||
                  null,
                _name:
                  includedProduct?.name ||
                  item.snapshotName ||
                  item.label ||
                  "Unavailable item",
                _price: includedProduct?.price ?? null,
              };
            }) || [];

          return {
            _id: group._id,
            templateId: group.templateId ?? null,
            name: group.name,
            isMain: group.isMain ?? false,
            linkedToGroupId: group.linkedToGroupId ?? null,
            required: group.required,
            minSelect: group.minSelect,
            maxSelect: group.maxSelect,
            maxQty: group.maxQty ?? Math.max(group.minSelect, group.maxSelect),
            items,
          };
        }) || [];

      // Warn about removed items
      const totalOriginalItems =
        editProduct.modifierGroups?.reduce(
          (sum, group) => sum + (group.items?.length ?? 0),
          0,
        ) ?? 0;
      const totalMappedItems = modifierGroups.reduce(
        (sum, group) => sum + group.items.length,
        0,
      );
      const removedItemCount = totalOriginalItems - totalMappedItems;

      if (removedItemCount > 0) {
        toast.warning(
          `${removedItemCount} included item${
            removedItemCount === 1 ? "" : "s"
          } no longer exists and was removed.`,
        );
      }

      setModifierGroupsState(modifierGroups);

      setFormData({
        name: editProduct.name || "",
        price: editProduct.price?.toString() || "",
        info: editProduct.info || "",
        description: editProduct.description || "",
        isSignature: editProduct.isSignature || false,
        isPopular: editProduct.isPopular || false,
        isActive: editProduct.isActive !== false,
        isComingSoon: editProduct.isComingSoon || false,
        isOnlineExclusive: editProduct.isOnlineExclusive || false,
        goLiveDate: formatDateInputValue(editProduct.goLiveDate),
        goLiveTime: toTimeInputValue(editProduct.goLiveDate),
        productType: editProduct.productType || ITEM_TYPES.SOLO,
        paxCount: editProduct.paxCount?.toString() || "",
      });
    }
  }, [editProduct]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const toggleFieldChange = (name: string, value: boolean) =>
    handleChange({
      target: { name, value: String(value), type: "checkbox", checked: value },
    } as unknown as ChangeEvent<HTMLInputElement>);

  const handleProductTypeChange = (type: ProductType) => {
    setFormData((prev) => ({
      ...prev,
      productType: type,
      paxCount: type !== ITEM_TYPES.SET ? "" : prev.paxCount,
    }));
    // Clear modifier groups when switching to solo — section will unmount anyway
    if (type === ITEM_TYPES.SOLO) {
      setModifierGroupsState([]);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      let imageData =
        imageSelection.activeTab === "gallery"
          ? imageSelection.galleryUrl || ""
          : imageSelection.activeTab === "url"
            ? imageSelection.imageUrl
            : "";

      let categoryId = categorySelection.categoryId;
      let subcategoryId = categorySelection.subcategoryId || null;

      if (imageSelection.activeTab === "upload" && imageSelection.imageFile) {
        imageData = await fileToBase64(imageSelection.imageFile);
      }

      if (!imageData)
        throw new Error("Please provide an image via upload, URL, or gallery");

      // Validate modifier group number fields are filled (not empty strings)
      if (isComboOrSet) {
        const emptyGroup = modifierGroupsState.find(
          (g) =>
            !g.linkedToGroupId &&
            (g.minSelect === "" || g.maxSelect === "" || g.maxQty === ""),
        );
        if (emptyGroup) {
          throw new Error(
            `Fill in Min, Max, and Max Quantity for "${emptyGroup.name || "modifier group"}"`,
          );
        }
      }

      if (
        categorySelection.showCustomCategory &&
        categorySelection.customCategory
      ) {
        const newCat = await categories_api.create({
          name: categorySelection.customCategory,
        });
        categoryId = newCat?._id;
      }

      if (
        categorySelection.showCustomSubcategory &&
        categorySelection.customSubcategory &&
        categoryId
      ) {
        const newSub = await subcategories_api.create({
          name: categorySelection.customSubcategory,
          categoryId,
        });
        subcategoryId = newSub._id;
      }

      // Effective isComingSoon — forced off for products older than 30 days
      const effectiveComingSoon = isProductTooOldForComingSoon
        ? false
        : formData.isComingSoon;

      const payload = {
        name: formData.name,
        info: formData.info,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : null,
        image: imageData.startsWith("https") ? imageData : undefined,
        imageFile: imageData.startsWith("data:") ? imageData : undefined,
        category: categoryId,
        subcategory: subcategoryId,
        isSignature: formData.isSignature,
        isPopular: formData.isPopular,
        isActive: formData.isActive,
        isComingSoon: effectiveComingSoon,
        isOnlineExclusive: formData.isOnlineExclusive,
        // Only send goLiveDate when coming-soon is active — otherwise the server
        // would see a future date and force isComingSoon back to true
        goLiveDate:
          effectiveComingSoon && formData.goLiveDate
            ? new Date(
                `${formData.goLiveDate}T${formData.goLiveTime || "00:00"}`,
              ).toISOString()
            : null,
        productType: formData.productType,
        paxCount: formData.paxCount ? parseInt(formData.paxCount) : null,
        modifierGroups: isComboOrSet
          ? modifierGroupsState.map((group) => {
              // Parse string | number → number. Empty string (cleared input)
              // defaults to 1 so the API always receives valid integers.
              const min =
                typeof group.minSelect === "number" ? group.minSelect : 1;
              const max =
                typeof group.maxSelect === "number" ? group.maxSelect : min;
              const qty =
                typeof group.maxQty === "number"
                  ? group.maxQty
                  : Math.max(min, max);
              return {
                templateId: group.templateId ?? null,
                name: group.name,
                isMain: group.isMain ?? false,
                linkedToGroupId: group.linkedToGroupId ?? null,
                required: group.required,
                minSelect: min,
                maxSelect: max,
                maxQty: qty,
                items: group.items.map(
                  ({ product, label, price, _name, _price }) => ({
                    product,
                    label,
                    price: price ?? null,
                    snapshotName: _name || label || null,
                    snapshotPrice: _price ?? null,
                  }),
                ),
              };
            })
          : [],
      };

      if (isEditMode && editProduct) {
        await updateMutation.mutateAsync({
          id: editProduct._id,
          data: payload,
        });
        toast.success("Updated successfully!");
        router.back();
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Created successfully!");
        router.back();
      }
    } catch (error) {}
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="min-h-screen">
        {/* ── Sticky Page Header ── */}
        <header className="sticky top-20 z-30 bg-white border-b border-gray-200">
          <div className="mx-auto px-6 py-4">
            <SectionHeader
              breadcrumb={[
                {
                  href: "/products",
                  name: "Products",
                },
                {
                  href: "/products/new",
                  name: "New Products",
                  className: "text-brand-color-500",
                },
              ]}
              title={
                isEditMode ? `Edit: ${editProduct?.name}` : "Add New Product"
              }
              actions={
                <div className="gap-2 flex items-center">
                  <IconButton
                    onClick={() => router.back()}
                    disabled={isLoading}
                    variant="outline"
                    text="Cancel"
                    className="px-4 rounded-lg"
                  />
                  <IconButton
                    type="submit"
                    disabled={isLoading}
                    form="product-form"
                    icon={{ name: "Save" }}
                    text={
                      isLoading
                        ? isEditMode
                          ? "Updating..."
                          : "Creating..."
                        : isEditMode
                          ? "Save Changes"
                          : "Create Product"
                    }
                    className="px-4 rounded-lg"
                  />
                </div>
              }
            />
          </div>
        </header>

        {/* ── Body ── */}
        <form id="product-form" onSubmit={handleSubmit}>
          <div className="mx-auto px-6 py-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* ════════════════════════════════════════
                LEFT COLUMN (col-span-2)
            ════════════════════════════════════════ */}
              <div className="lg:col-span-2 space-y-6">
                {/* ── Identity ── */}
                <ProductSectionCard title="Product Identity" iconName="Beef">
                  {/* Name */}
                  <InputField
                    label="Product Name"
                    leftIcon={<DynamicIcon name="Beef" size={18} />}
                    placeholder="e.g., Pork Sinigang"
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                  {/* Product Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {PRODUCT_TYPE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleProductTypeChange(opt.value)}
                          className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-sm font-semibold transition-all duration-150 cursor-pointer
                          ${
                            formData.productType === opt.value
                              ? "border-brand-color-500  text-brand-color-500"
                              : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                          }`}
                        >
                          {opt.icon}
                          <span>{opt.label}</span>
                          <span className="text-[10px] font-normal text-center leading-tight opacity-70">
                            {opt.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </ProductSectionCard>

                {/* ── Category & Subcategory ── */}
                <CategorySection
                  initialCategoryId={
                    typeof editProduct?.category === "string"
                      ? editProduct.category
                      : editProduct?.category?._id || undefined
                  }
                  initialSubcategoryId={
                    typeof editProduct?.subcategory === "string"
                      ? editProduct.subcategory
                      : editProduct?.subcategory?._id || undefined
                  }
                  onCategoryStateChange={setCategorySelection}
                />

                {/* ── Descriptions ── */}
                <ProductSectionCard title="Descriptions" iconName="FileText">
                  <TextareaField
                    label="Product Info"
                    placeholder="e.g. Crispy fried chicken with rice and salad"
                    name="info"
                    value={formData.info}
                    onChange={handleChange}
                  />
                  <TextareaField
                    label="Product Description"
                    placeholder="e.g. Our signature crispy fried chicken, marinated in our secret blend of 12 spices for 24 hours…"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </ProductSectionCard>

                {/* ── Modifier Groups (combo / set) ── */}
                {isComboOrSet && (
                  <ModifierGroupsSection
                    initialModifierGroups={modifierGroupsState}
                    onModifierGroupsChange={setModifierGroupsState}
                    groupOrder={groupOrder}
                  />
                )}

                {/* ── Image Section ── */}
                <ImageSection
                  initialImageUrl={editProduct?.image?.url || undefined}
                  onImageStateChange={setImageSelection}
                />
              </div>

              {/* ════════════════════════════════════════
                RIGHT COLUMN (col-span-1)
            ════════════════════════════════════════ */}
              <div className="space-y-6">
                {/* ── Pricing & Tax ── */}
                <ProductSectionCard title="Pricing" iconName="Tag">
                  <InputField
                    label="Selling Price (₱)"
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    leftIcon={<DynamicIcon name="DollarSign" />}
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />

                  <TaxBreakdown price={formData.price} />
                </ProductSectionCard>

                {/* ── Combo Price Preview (combo / set only) ── */}
                {isComboOrSet &&
                  modifierGroupsState.length > 0 &&
                  formData.price && (
                    <ComboPricePreview
                      price={formData.price}
                      modifierGroups={modifierGroupsState}
                    />
                  )}

                {/* ── Group Reorder Panel (combo / set, 2+ groups) ── */}
                {isComboOrSet && modifierGroupsState.length >= 2 && (
                  <GroupReorderPanel
                    groups={modifierGroupsState}
                    onOrderChange={setGroupOrder}
                  />
                )}

                {/* ── Pax Count (set only) ── */}
                {formData.productType === "set" && (
                  <ProductSectionCard title="Set Details" iconName="Users">
                    <InputField
                      label="Pax Count"
                      placeholder="e.g., 4"
                      type="number"
                      id="paxCount"
                      name="paxCount"
                      value={formData.paxCount}
                      onChange={handleChange}
                    />
                  </ProductSectionCard>
                )}

                {/* ── Visibility Toggles ── */}
                <ProductSectionCard
                  title="Visibility & Badges"
                  iconName="Sparkles"
                >
                  {/* Active — controls whether customers can see this product */}
                  <VisibilityToggles
                    title="Active"
                    subTitle="Hide from customer menu without deleting"
                  >
                    <ToggleButton
                      checked={formData.isActive}
                      onCheckedChange={(value) =>
                        toggleFieldChange("isActive", value)
                      }
                    />
                  </VisibilityToggles>

                  {/* Coming Soon — visible on menu but cannot be ordered */}
                  <VisibilityToggles
                    title="Coming Soon"
                    subTitle={
                      isProductTooOldForComingSoon
                        ? "Disabled — products older than 30 days cannot be set to Coming Soon"
                        : "Show on menu with a badge, but disable ordering"
                    }
                  >
                    <ToggleButton
                      checked={
                        isProductTooOldForComingSoon
                          ? false
                          : formData.isComingSoon
                      }
                      disabled={isProductTooOldForComingSoon}
                      onCheckedChange={(value) =>
                        toggleFieldChange("isComingSoon", value)
                      }
                    />
                  </VisibilityToggles>

                  {/* Go-Live Date — schedule when the product automatically goes live */}
                  {formData.isComingSoon && !isProductTooOldForComingSoon && (
                    <div className="flex flex-col gap-3 border border-blue-100 rounded-xl p-4 bg-blue-50/50">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          Schedule Go-Live
                        </p>
                        <p className="text-xs text-gray-500">
                          Product auto-goes live at this date & time. Leave
                          empty for manual control.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <InputField
                          type="date"
                          name="goLiveDate"
                          value={formData.goLiveDate}
                          onChange={handleChange}
                          min={formatDateInputValue(new Date())}
                          className="text-gray-500 flex-1"
                        />
                        <InputField
                          type="time"
                          name="goLiveTime"
                          value={formData.goLiveTime}
                          onChange={handleChange}
                          className="text-gray-500 w-28"
                        />
                      </div>
                    </div>
                  )}

                  {/* Signature */}
                  <VisibilityToggles
                    title="Signature Product"
                    subTitle="Apperrs in 'Our Signature Products' section"
                  >
                    <ToggleButton
                      checked={formData.isSignature}
                      onCheckedChange={(value) =>
                        toggleFieldChange("isSignature", value)
                      }
                    />
                  </VisibilityToggles>

                  {/* Popular */}
                  <VisibilityToggles
                    title="Popular Item"
                    subTitle="Highlights this product as best-seller"
                  >
                    <ToggleButton
                      checked={formData.isPopular}
                      onCheckedChange={(value) =>
                        toggleFieldChange("isPopular", value)
                      }
                    />
                  </VisibilityToggles>

                  {/* Online Exclusive */}
                  <VisibilityToggles
                    title="Online Exclusive"
                    subTitle="Available only when ordering online"
                  >
                    <ToggleButton
                      checked={formData.isOnlineExclusive}
                      onCheckedChange={(value) =>
                        toggleFieldChange("isOnlineExclusive", value)
                      }
                    />
                  </VisibilityToggles>
                </ProductSectionCard>

                {/* ── Success status ── */}
                {isSuccess && (
                  <div className="p-4 rounded-xl font-medium bg-green-50 text-green-700 border border-green-200 text-sm">
                    ✓ Product {isEditMode ? "updated" : "created"} successfully!
                  </div>
                )}

                {/* ── Image Preview ── */}
                {previewUrl && (
                  <div className="bg-white sticky top-48 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 bg-gray-50/70">
                      <span className="text-brand-color-500">
                        <DynamicIcon name="Eye" size={15} />
                      </span>
                      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        Preview
                      </h2>
                    </div>
                    <div className="h-60 aspect-square object-contain place-self-center">
                      <AppImage src={previewUrl} alt="Product preview" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProductFormPage;
