"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

interface VisitorStats {
  totalVisits: number;
  uniqueVisitors: number;
  newSessions: number;
  visitsByCountry: Array<{ _id: string; count: number }>;
  visitsByPath: Array<{ _id: string; count: number }>;
  recentVisits: Array<any>;
  period: number;
}

interface LocationStats {
  visitorsByCountry: Array<{ _id: string; count: number }>;
  visitorsByCity: Array<{ _id: { city: string; country: string }; count: number }>;
  visitorsWithLocation: number;
  topCountries: Array<{ _id: string; count: number }>;
  topCities: Array<{ _id: { city: string; country: string; region?: string }; count: number }>;
  period: number;
}

export default function VisitorsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [locationStats, setLocationStats] = useState<LocationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    if (!session || (session.user as any)?.role !== "admin") {
      router.push("/login");
      return;
    }

    fetchStats();
  }, [session, days]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [statsRes, locationRes] = await Promise.all([
        fetch(`/api/visitors/track?days=${days}`),
        fetch(`/api/visitors/location?days=${days}`),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (locationRes.ok) {
        const locationData = await locationRes.json();
        setLocationStats(locationData);
      }
    } catch (error) {
      console.error("Error fetching visitor stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading visitor statistics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Visitor Analytics
          </h1>
          
          <div className="flex gap-2 mb-6">
            {[1, 7, 30, 90].map((d) => (
              <AnimatedButton
                key={d}
                variant={days === d ? "primary" : "secondary"}
                onClick={() => setDays(d)}
              >
                {d} {d === 1 ? "Day" : "Days"}
              </AnimatedButton>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <AnimatedCard delay={0.1}>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stats.totalVisits.toLocaleString()}
                </div>
                <p className="text-gray-600 dark:text-gray-400">Total Visits</p>
              </div>
            </AnimatedCard>
            <AnimatedCard delay={0.2}>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stats.uniqueVisitors.toLocaleString()}
                </div>
                <p className="text-gray-600 dark:text-gray-400">Unique Visitors</p>
              </div>
            </AnimatedCard>
            <AnimatedCard delay={0.3}>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stats.newSessions.toLocaleString()}
                </div>
                <p className="text-gray-600 dark:text-gray-400">New Sessions</p>
              </div>
            </AnimatedCard>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Countries */}
          {locationStats && locationStats.topCountries.length > 0 && (
            <AnimatedCard delay={0.4}>
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Top Countries
              </h2>
              <div className="space-y-3">
                {locationStats.topCountries.map((country, index) => (
                  <div key={country._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        #{index + 1}
                      </span>
                      <span className="text-gray-900 dark:text-white">{country._id}</span>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {country.count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          )}

          {/* Top Cities */}
          {locationStats && locationStats.topCities.length > 0 && (
            <AnimatedCard delay={0.5}>
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Top Cities
              </h2>
              <div className="space-y-3">
                {locationStats.topCities.map((city, index) => (
                  <div key={`${city._id.city}-${city._id.country}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        #{index + 1}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {city._id.city}, {city._id.country}
                      </span>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {city.count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          )}

          {/* Top Pages */}
          {stats && stats.visitsByPath.length > 0 && (
            <AnimatedCard delay={0.6}>
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Top Pages
              </h2>
              <div className="space-y-3">
                {stats.visitsByPath.map((path, index) => (
                  <div key={path._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        #{index + 1}
                      </span>
                      <span className="text-gray-900 dark:text-white font-mono text-sm">
                        {path._id}
                      </span>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {path.count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          )}

          {/* Recent Visits */}
          {stats && stats.recentVisits.length > 0 && (
            <AnimatedCard delay={0.7}>
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Recent Visits
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {stats.recentVisits.slice(0, 20).map((visit: any) => (
                  <div
                    key={visit._id}
                    className="flex items-center justify-between text-sm border-b border-gray-200 dark:border-gray-800 pb-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 dark:text-white font-mono truncate">
                        {visit.path}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        {visit.country && `${visit.country}`}
                        {visit.city && `, ${visit.city}`}
                        {visit.userId && ` • User: ${visit.userId.name || visit.userId.email}`}
                      </div>
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs ml-4">
                      {new Date(visit.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          )}
        </div>
      </div>
    </div>
  );
}

