"use client";

import { useEffect, useState } from "react";
import type { ProfessionalPhotoAssetView } from "@/lib/professional-identity/professional-photo";

type ProfessionalPhotoAvatarProps = {
  photo: ProfessionalPhotoAssetView | null | undefined;
  alt: string;
  fallback: string;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
};

export function ProfessionalPhotoAvatar({
  photo,
  alt,
  fallback,
  className = "",
  imageClassName = "h-full w-full object-cover",
  fallbackClassName = "flex h-full w-full items-center justify-center"
}: ProfessionalPhotoAvatarProps) {
  const [loadFailed, setLoadFailed] = useState(false);
  const signedUrl = photo?.photoStatus === "ready" && photo.signedUrl && !loadFailed ? photo.signedUrl : "";
  const fallbackLabel = photo?.photoStatus === "ready" ? "Saved professional profile image preview unavailable" : "No professional profile image saved";

  useEffect(() => {
    setLoadFailed(false);
  }, [photo?.signedUrl, photo?.storagePath]);

  return (
    <div className={className}>
      {signedUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={signedUrl} alt={alt} className={imageClassName} onError={() => setLoadFailed(true)} />
      ) : (
        <span className={fallbackClassName} aria-label={fallbackLabel}>{fallback}</span>
      )}
    </div>
  );
}
