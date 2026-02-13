"use client";

import { FormInput } from "@/components/ui/form/FormInput";
import { InputField } from "@/components/ui/InputField";
import { Beef, DollarSign, Link, Share, ShoppingBag } from "lucide-react";
import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import DashboardPage from "./dashboard/page";

interface ProductFormData {
  name: string;
  price: string;
  description: string;
  image: string;
  category: string;
}

export default function ProductFormDynamicCategories() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "",
    description: "",
    image: "",
    category: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Category management
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  // Load existing categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/products?action=categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (value === "__add_new__") {
      setShowCustomCategory(true);
      setFormData({ ...formData, category: "" });
    } else {
      setShowCustomCategory(false);
      setFormData({ ...formData, category: value });
    }
  };

  const handleCustomCategoryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomCategory(value);
    setFormData({ ...formData, category: value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 5 * 1024 * 1024) {
        setMessage("✗ Image size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setMessage("✗ Please select a valid image file");
        return;
      }

      setImageFile(file);
      setMessage("");
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let imageData = formData.image;

      if (imageFile) {
        imageData = await fileToBase64(imageFile);
      }

      if (!imageData) {
        throw new Error("Please provide an image URL or upload an image");
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          image: imageData.startsWith("http") ? imageData : undefined,
          imageFile: imageData.startsWith("data:") ? imageData : undefined,
          category: formData.category,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create product");
      }

      const result = await response.json();
      setMessage("✓ Product created successfully!");

      // Reset form
      setFormData({
        name: "",
        price: "",
        description: "",
        image: "",
        category: "",
      });
      setImageFile(null);
      setShowCustomCategory(false);
      setCustomCategory("");

      // Reload categories to include the new one
      fetchCategories();

      const fileInput = document.getElementById(
        "imageFile",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      console.log("Created product:", result);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `✗ ${error.message}`
          : "✗ Failed to create product",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md h-[calc(100vh-100px)] overflow-y-auto mt-16">
    //   <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h2>

    //   <form onSubmit={handleSubmit} className="space-y-5">
    //     {/* Product Name */}
    //     <InputField
    //       label="Product Name"
    //       leftIcon={<Beef size={18} />}
    //       placeholder="e.g., Pork Sinigang"
    //       type="text"
    //       id="name"
    //       name="name"
    //       value={formData.name}
    //       onChange={handleChange}
    //       required
    //     />

    //     {/* Price */}
    //     <InputField
    //       label="Price"
    //       leftIcon={<DollarSign size={18} />}
    //       placeholder="0.00"
    //       type="number"
    //       id="price"
    //       name="price"
    //       value={formData.price}
    //       onChange={handleChange}
    //       required
    //     />

    //     {/* Description */}
    //     <div>
    //       <label
    //         htmlFor="description"
    //         className="block text-sm font-semibold text-gray-700 mb-2"
    //       >
    //         Description <span className="text-red-500">*</span>
    //       </label>
    //       <textarea
    //         id="description"
    //         name="description"
    //         value={formData.description}
    //         onChange={handleChange}
    //         required
    //         rows={4}
    //         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e13e00] focus:border-[#e13e00]/20 outline-none transition resize-none"
    //         placeholder="Describe your dish in detail..."
    //       />
    //     </div>

    //     {/* Category (Dynamic) */}
    //     <div>
    //       <label
    //         htmlFor="categorySelect"
    //         className="block text-sm font-semibold text-gray-700 mb-2"
    //       >
    //         Category <span className="text-red-500">*</span>
    //       </label>

    //       {loadingCategories ? (
    //         <div className="px-4 py-3 border border-gray-300 rounded-lg text-gray-500">
    //           Loading categories...
    //         </div>
    //       ) : (
    //         <>
    //           <select
    //             id="categorySelect"
    //             onChange={handleCategoryChange}
    //             value={showCustomCategory ? "__add_new__" : formData.category}
    //             required={!showCustomCategory}
    //             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e13e00] focus:border-[#e13e00]/20 outline-none transition cursor-pointer"
    //           >
    //             <option value="">Select a category</option>
    //             {categories.map((cat) => (
    //               <option key={cat} value={cat}>
    //                 {cat
    //                   .replace(/-/g, " ")
    //                   .split(" ")
    //                   .map(
    //                     (word) => word.charAt(0).toUpperCase() + word.slice(1),
    //                   )
    //                   .join(" ")}
    //               </option>
    //             ))}
    //             <option
    //               value="__add_new__"
    //               className="text-[#e13e00] semi-font-bold"
    //             >
    //               Add New Category +{" "}
    //             </option>
    //           </select>

    //           {/* Custom Category Input */}
    //           {showCustomCategory && (
    //             <div className="mt-3">
    //               <input
    //                 type="text"
    //                 value={customCategory}
    //                 onChange={handleCustomCategoryChange}
    //                 required
    //                 placeholder="Enter new category name"
    //                 className="w-full px-4 py-3 border border-[#e13e00] rounded-lg focus:ring-2 focus:ring-[#e13e00] focus:border-[#e13e00]/20 outline-none transition"
    //               />
    //               <p className="text-xs text-gray-500 mt-1">
    //                 Tip: Use simple names like "Full Plates", "Favourites",
    //                 "Dessert"
    //               </p>
    //             </div>
    //           )}
    //         </>
    //       )}
    //     </div>

    //     {/* Image Upload */}
    //     <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
    //       <label className="block text-sm font-semibold text-gray-700 mb-3">
    //         Product Image <span className="text-red-500">*</span>
    //       </label>

    //       <div className="mb-4">
    //         <label
    //           htmlFor="imageFile"
    //           className="block text-xs text-gray-600 mb-2"
    //         >
    //           Upload Image (Max 5MB)
    //         </label>
    //         <input
    //           type="file"
    //           id="imageFile"
    //           accept="image/*"
    //           onChange={handleImageChange}
    //           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e13e00] focus:border-[#e13e00]/20 outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#e13e00]/20 file:text-[#e13e00] hover:file:bg-[#e13e00]/30 cursor-pointer"
    //         />
    //         {imageFile && (
    //           <p className="text-sm text-green-600 mt-2">
    //             ✓ Selected: {imageFile.name} (
    //             {(imageFile.size / 1024 / 1024).toFixed(2)} MB)
    //           </p>
    //         )}
    //       </div>

    //       <div className="text-center text-gray-500 text-sm my-2">OR</div>

    //       <div>
    //         <label htmlFor="image" className="block text-xs text-gray-600 mb-2">
    //           Paste Image URL
    //         </label>
    //         <InputField 
    //          type="url"
    //           id="image"
    //           name="image"
    //           value={formData.image}
    //           onChange={handleChange}
    //           disabled={!!imageFile}
    //           placeholder="https://example.com/image.jpg"
    //           leftIcon={<Link size={16} />}
    //         />
    //       </div>
    //     </div>

    //     {/* Image Preview */}
    //     {(formData.image || imageFile) && (
    //       <div className="border border-gray-300 rounded-lg p-4">
    //         <p className="text-sm font-semibold text-gray-700 mb-3">Preview:</p>
    //         <img
    //           src={imageFile ? URL.createObjectURL(imageFile) : formData.image}
    //           alt="Product preview"
    //           className="w-full max-w-md h-64 object-cover rounded-lg mx-auto shadow-sm"
    //           onError={(e) => {
    //             e.currentTarget.src =
    //               "https://via.placeholder.com/400x300?text=Invalid+Image";
    //           }}
    //         />
    //       </div>
    //     )}

    //     {/* Submit Button */}
    //     <button
    //       type="submit"
    //       disabled={loading}
    //       className="w-full bg-[#e13e00] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#c13500] disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
    //     >
    //       {loading ? (
    //         <span className="flex items-center justify-center">
    //           <svg
    //             className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
    //             xmlns="http://www.w3.org/2000/svg"
    //             fill="none"
    //             viewBox="0 0 24 24"
    //           >
    //             <circle
    //               className="opacity-25"
    //               cx="12"
    //               cy="12"
    //               r="10"
    //               stroke="currentColor"
    //               strokeWidth="4"
    //             ></circle>
    //             <path
    //               className="opacity-75"
    //               fill="currentColor"
    //               d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    //             ></path>
    //           </svg>
    //           Creating Product...
    //         </span>
    //       ) : (
    //         "✓ Create Product"
    //       )}
    //     </button>
    //   </form>

    //   {/* Status Message */}
    //   {message && (
    //     <div
    //       className={`mt-6 p-4 rounded-lg font-medium ${
    //         message.includes("✓")
    //           ? "bg-green-50 text-green-700 border border-green-200"
    //           : "bg-red-50 text-red-700 border border-red-200"
    //       }`}
    //     >
    //       {message}
    //     </div>
    //   )}

    //   {/* Category Count */}
    //   {!loadingCategories && categories.length > 0 && (
    //     <div className="mt-4 text-sm text-gray-500 text-center">
    //       {categories.length} categor{categories.length === 1 ? "y" : "ies"}{" "}
    //       available
    //     </div>
    //   )}
    // </div>

    <DashboardPage />
  );
}
