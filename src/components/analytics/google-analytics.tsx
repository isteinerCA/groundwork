import Script from "next/script";

export function GoogleAnalytics() {
  const fromEnv = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  // Ignore the old client-account ID if it is still set on Vercel.
  const measurementId =
    fromEnv && fromEnv !== "G-Q6DYHCBE2Z"
      ? fromEnv
      : process.env.NODE_ENV === "production"
        ? "G-QSRXLLVJEL"
        : undefined;
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
