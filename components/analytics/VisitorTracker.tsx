"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Generate or retrieve session ID
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  
  let sessionId = sessionStorage.getItem("visitor_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("visitor_session_id", sessionId);
  }
  return sessionId;
}

// Get location data using a free IP geolocation service
async function getLocationData(ip: string): Promise<any> {
  if (!ip || ip === "unknown" || ip.startsWith("127.") || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    // Skip localhost/private IPs
    return null;
  }

  try {
    // Using ipapi.co free tier (1000 requests/day)
    // You can replace with other services like ip-api.com, ipgeolocation.io, etc.
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (response.ok) {
      const data = await response.json();
      if (data.error) {
        throw new Error(data.reason || "API error");
      }
      return {
        country: data.country_name || data.country,
        region: data.region || data.region_code,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
      };
    }
  } catch (error) {
    console.warn("Failed to fetch location data from ipapi.co:", error);
  }
  
  // Fallback: try ip-api.com (free, no API key needed)
  try {
    const response = await fetch(`https://ip-api.com/json/${ip}`);
    if (response.ok) {
      const data = await response.json();
      if (data.status === "success") {
        return {
          country: data.country,
          region: data.regionName,
          city: data.city,
          latitude: data.lat,
          longitude: data.lon,
          timezone: data.timezone,
        };
      }
    }
  } catch (error) {
    console.warn("Failed to fetch location data from ip-api.com:", error);
  }
  
  return null;
}

export function VisitorTracker() {
  const pathname = usePathname();
  const trackedRef = useRef<Set<string>>(new Set());
  const visitorIdRef = useRef<string | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    // Ensure we're in the browser
    if (typeof window === "undefined") return;
    
    // Mark as mounted
    mountedRef.current = true;
    
    // Skip tracking for admin pages and API routes
    if (!pathname || pathname.startsWith("/api") || pathname.startsWith("/MonyAdmin")) {
      return;
    }

    // Track each path only once per session
    if (trackedRef.current.has(pathname)) {
      return;
    }
    trackedRef.current.add(pathname);

    const trackVisit = async () => {
      try {
        const sessionId = getSessionId();
        
        // Track the visit
        const response = await fetch("/api/visitors/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: pathname,
            sessionId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          visitorIdRef.current = data.visitorId;

          // Try to get location data (async, non-blocking)
          if (data.visitorId && data.ip && data.ip !== "unknown") {
            // Fetch location data using IP
            getLocationData(data.ip)
              .then((locationData) => {
                if (locationData) {
                  // Update visitor with location
                  return fetch("/api/visitors/location", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      visitorId: data.visitorId,
                      locationData,
                    }),
                  });
                }
              })
              .catch((err) => {
                console.warn("Failed to update location:", err);
              });
          }
        }
      } catch (error) {
        // Silently fail - don't break the user experience
        console.warn("Visitor tracking error:", error);
      }
    };

    // Small delay to avoid blocking page load
    const timeoutId = setTimeout(trackVisit, 500);
    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null; // This component doesn't render anything
}

// Default export for dynamic import
export default VisitorTracker;

