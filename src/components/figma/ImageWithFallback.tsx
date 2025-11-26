import React, { useState } from "react";

const ERROR_IMG_SRC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==";

export function ImageWithFallback(
  props: React.ImgHTMLAttributes<HTMLImageElement>
) {
  const [didError, setDidError] = useState(false);

  const handleError = () => {
    setDidError(true);
  };

  const { src, alt, style, className, ...rest } = props;

  // Image resolution policy:
  // - If the src starts with '/uploads' -> prefix with backend API base URL
  // - Otherwise, treat as a local/front-end asset and use as-is
  let resolvedSrc: string | undefined = undefined;
  try {
    const API_BASE =
      (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:3000";
    if (typeof src === "string") {
      if (src.startsWith("/uploads")) resolvedSrc = `${API_BASE}${src}`;
      else resolvedSrc = src;
    }
  } catch (e) {
    resolvedSrc = typeof src === "string" ? src : undefined;
  }

  // Development-only debug to help trace why image sizing isn't applying.
  // This logs the incoming props when in dev mode so you can inspect class/style.
  // Vite environment flag (development-only). Use a safe check so TypeScript doesn't fail.
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-console
    if ((import.meta as any).env?.DEV)
      console.debug("ImageWithFallback props:", {
        src,
        alt,
        style,
        className,
        rest,
      });
  } catch (e) {
    /* ignore in non-Vite environments */
  }

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${
        className ?? ""
      }`}
      style={style}
    >
      <div className="flex items-center justify-center">
        <img
          src={ERROR_IMG_SRC}
          alt="Error loading image"
          {...rest}
          data-original-url={resolvedSrc ?? (src as string)}
          className={className} // ⭐ bảo toàn className gốc
        />
      </div>
    </div>
  ) : (
    <img
      src={resolvedSrc ?? (src as string)}
      alt={alt}
      className={className} // ⭐ không ép width/height/object-cover
      style={style}
      {...rest}
      onError={handleError}
    />
  );
}
