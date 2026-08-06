import { buildEmbedUrl } from "@/lib/google-maps";
import { cn } from "@/lib/utils";

type MapPreviewProps = {
  lat: number;
  lng: number;
  /** Label displayed above the map. Defaults to "Branch location" when isBranch is true, otherwise "Your pinned location". */
  label?: string;
  isBranch?: boolean;
  /** Additional classes for the outer wrapper (e.g. "mt-0" to override default margin). */
  className?: string;
  /** Additional classes for the iframe container div. */
  containerClassName?: string;
  /** Additional classes for the iframe element itself (e.g. "h-64" to change height). */
  iframeClassName?: string;
};

const MapPreview = ({
  lat,
  lng,
  label,
  isBranch = false,
  className,
  containerClassName,
  iframeClassName,
}: MapPreviewProps) => {
  const displayLabel = label ?? (isBranch ? "Branch location" : "Your pinned location");

  return (
    <div className={cn("space-y-1 mt-4", className)}>
      <p className="text-xs font-medium text-slate-700">{displayLabel}</p>
      <div className={cn("overflow-hidden rounded-xl border border-slate-200", containerClassName)}>
        <iframe
          title={`${displayLabel} preview`}
          className={cn("h-48 w-full border-0", iframeClassName)}
          loading="lazy"
          src={buildEmbedUrl(lat, lng)}
        />
      </div>
    </div>
  );
};

export default MapPreview;
