import {
  forwardRef,
  ImgHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { twMerge } from "tailwind-merge";

type ImageProps = ImgHTMLAttributes<HTMLImageElement>;

export const AppImage = forwardRef<HTMLImageElement, ImageProps>(
  ({ src, alt = "Order item", className, ...props }, ref) => {
    const [hasError, setHasError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const imgRef = useRef<HTMLImageElement>(null);

    const setRef = useCallback(
      (node: HTMLImageElement | null) => {
        imgRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    useEffect(() => {
      setImageLoaded(false);
      setHasError(false);

      if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
        setImageLoaded(true);
      }
    }, [src]);

    if (!src || hasError) {
      return (
        <div
          role="img"
          aria-label={`${src} image not available`}
          className="w-full h-full flex flex-col items-center justify-center bg-gray-50"
        >
          <DynamicIcon
            name="FileX"
            size={20}
            className="text-brand-color-400"
            aria-hidden="true"
          />
        </div>
      );
    }

    return (
      <div className="relative w-full h-full">
        {!imageLoaded && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 ">
            <DynamicIcon
              name="Loader2"
              size={20}
              className="text-gray-300 animate-spin"
            />
          </div>
        )}

        <img
          ref={setRef}
          src={src}
          alt={alt}
          className={twMerge(
            "w-full h-full object-cover transition-opacity duration-200",
            imageLoaded ? "opacity-100" : "opacity-0",
            className,
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => setHasError(true)}
          {...props}
        />
      </div>
    );
  },
);

AppImage.displayName = "Image";
