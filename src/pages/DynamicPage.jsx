import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function DynamicPage() {
  const { slug } = useParams();

  // These pages are hosted on chicagofleetwraps.com
  const externalUrl = `https://chicagofleetwraps.com/${slug}/`;

  useEffect(() => {
    // Redirect to the external page
    window.location.href = externalUrl;
  }, [externalUrl]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-lg text-slate-600">Redirecting to {slug}...</p>
      </div>
    </div>
  );
}