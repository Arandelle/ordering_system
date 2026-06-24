/** Skeleton placeholder that mimics the checkout form layout while data loads. */

const FieldSkeleton = () => (
  <div className="space-y-2">
    <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
    <div className="h-10 w-full rounded-lg bg-gray-200 animate-pulse" />
  </div>
);

const HalfFieldSkeleton = () => (
  <div className="space-y-2">
    <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
    <div className="h-10 w-full rounded-lg bg-gray-200 animate-pulse" />
  </div>
);

export const DetailsFormSkeleton = () => (
  <div className="space-y-5 py-6">
    {/* Two-column row: first name + last name */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <HalfFieldSkeleton />
      <HalfFieldSkeleton />
    </div>
    {/* Email */}
    <FieldSkeleton />
    {/* Phone */}
    <FieldSkeleton />
    {/* Notes textarea */}
    <div className="space-y-2">
      <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
      <div className="h-20 w-full rounded-lg bg-gray-200 animate-pulse" />
    </div>
  </div>
);

export const ShippingFormSkeleton = () => (
  <div className="space-y-5 py-6">
    {/* Pin location card */}
    <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 animate-pulse">
      <div className="h-10 w-10 shrink-0 rounded-full bg-gray-300" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-40 rounded bg-gray-300" />
        <div className="h-3 w-56 rounded bg-gray-300" />
      </div>
    </div>
    {/* Address line 1 */}
    <FieldSkeleton />
    {/* PSGC address fields */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <HalfFieldSkeleton />
      <HalfFieldSkeleton />
    </div>
    {/* Zip + Country row */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <HalfFieldSkeleton />
      <HalfFieldSkeleton />
    </div>
    {/* Landmark */}
    <FieldSkeleton />
  </div>
);
