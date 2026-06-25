import { DynamicIcon } from "./DynamicIcon";

export const FetchError = ({
  onRetry,
  error,
  title = "Something went wrong",
  description = "We couldn't load this content right now. Please check your connection and try again.",
}: {
  onRetry: () => void;
  error?: Error | null;
  title?: string;
  description?: string;
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
      <DynamicIcon name="TriangleAlert" className="w-8 h-8 text-red-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {error?.message ?? title}
    </h3>
    <p className="text-sm text-gray-500 mb-6 max-w-xs">{description}</p>
    <button
      onClick={onRetry}
      className="bg-brand-color-500 text-white px-6 py-2.5 text-sm font-bold hover:bg-brand-color-600 transition-colors rounded"
    >
      Try Again
    </button>
  </div>
);
