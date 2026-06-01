"use client";

import { useEffect, useState } from "react";

interface AdBannerProps {
  dataAdSlot: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: string;
}

export function AdBanner({
  dataAdSlot,
  dataAdFormat = "auto",
  dataFullWidthResponsive = "true",
}: AdBannerProps) {
  const [hasError, setHasError] = useState(false);
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

  useEffect(() => {
    // Solo inicializar si estamos en cliente, hay ID de editor y AdSense está disponible
    if (typeof window !== "undefined" && publisherId) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (error) {
        console.error("Error al cargar AdSense unit:", error);
        setHasError(true);
      }
    }
  }, [publisherId]);

  if (!publisherId) {
    // Si no está configurada la variable de entorno, muestra un placeholder visual en desarrollo
    if (process.env.NODE_ENV === "development") {
      return (
        <div className="my-4 flex h-24 w-full items-center justify-center border-2 border-dashed border-muted bg-muted/20 text-xs text-muted-foreground">
          [Anuncio de Google AdSense - Configura NEXT_PUBLIC_ADSENSE_PUBLISHER_ID]
        </div>
      );
    }
    return null;
  }

  if (hasError) {
    return null;
  }

  return (
    <div className="my-4 flex w-full justify-center overflow-hidden" aria-hidden="true">
      <ins
        className="adsbygoogle"
        style={{ display: "block", minWidth: "250px", minHeight: "90px" }}
        data-ad-client={publisherId}
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive}
      />
    </div>
  );
}
