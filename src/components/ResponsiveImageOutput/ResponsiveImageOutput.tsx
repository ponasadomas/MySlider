import React from 'react';

interface ResponsiveImageOutputProps {
  png: {
    height: number;
    width: number;
    images: {
      height: number;
      width: number;
      path: string;
    }[];
    src: string;
    srcSet: string;
  };

  webp?: {
    height: number;
    width: number;
    images: {
      height: number;
      width: number;
      path: string;
    }[];
    src: string;
    srcSet: string;
  };

  sizes: string;
  alt: string;
  lazy?: boolean;
  className?: string;
}

export function ResponsiveImageOutput({
  webp,
  png,
  sizes,
  alt,
  lazy,
  ...rest
}: ResponsiveImageOutputProps) {
  const loadingAttribute = lazy ? 'lazy' : undefined;
  const fallbackSrc = png.images[0]?.path ?? png.src;

  if (!fallbackSrc) return null;

  return (
    <picture className={rest.className}>
      {webp?.srcSet && <source srcSet={webp.srcSet} type="image/webp" sizes={sizes} />}
      {png.srcSet && <source srcSet={png.srcSet} type="image/png" sizes={sizes} />}

      <img
        src={fallbackSrc}
        width={png.width || undefined}
        height={png.height || undefined}
        alt={alt}
        loading={loadingAttribute}
      />
    </picture>
  );
}
