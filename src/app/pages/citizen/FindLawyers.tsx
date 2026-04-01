import { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Search, Star, MapPin, Briefcase, IndianRupee, Calendar, Loader } from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { lawyersAPI } from "../../services/api";
import { useCitizenRouteGuard } from "../../hooks/useCitizenRouteGuard";
import type { LawyerResponse } from "../../services/types";

interface LawyerWithDetails extends LawyerResponse {
  availability?: string;
  bio?: string;
}

export function FindLawyers() {
  // Protect route - only citizens can access
  const isAuthorized = useCitizenRouteGuard();

  const [searchQuery, setSearchQuery] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [priceRange, setPriceRange] = useState("all");

  // API state
  const [lawyers, setLawyers] = useState<LawyerWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch lawyers on initial load
  useEffect(() => {
    loadInitialLawyers();
  }, []);

  // Fetch lawyers when filters change
  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);

    // Debounce search to avoid too many API calls
    const timeout = setTimeout(() => {
      performSearch();
    }, 500);

    setSearchTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [searchQuery, specialty, priceRange]);

  const loadInitialLawyers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load verified lawyers instead (more reliable endpoint)
      const data = (await lawyersAPI.getVerifiedLawyers(0, 20)) as LawyerWithDetails[];
      setLawyers(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load lawyers";
      setError(errorMsg);
      console.error("Error loading lawyers:", err);
      // Fallback: try getting all lawyers
      try {
        const fallbackData = (await lawyersAPI.getLawyers(0, 20)) as LawyerWithDetails[];
        setLawyers(fallbackData);
        setError(null);
      } catch (fallbackErr) {
        console.error("Fallback error:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      let data: any = [];

      // If we have specific filters, use them
      if (specialty !== "all" && specialty !== "") {
        data = (await lawyersAPI.getLawyersBySpecialization(specialty, 0, 20)) as any;
        data = data.lawyers || data;
      } else if (searchQuery.trim()) {
        // Use search endpoint for text queries
        const result = (await lawyersAPI.searchLawyers({
          query: searchQuery,
          specialization: specialty === "all" ? undefined : specialty,
          verified_only: true,
          skip: 0,
          limit: 20,
        })) as any;
        data = result.lawyers || result;
      } else {
        // Load all verified lawyers
        data = (await lawyersAPI.getVerifiedLawyers(0, 20)) as LawyerWithDetails[];
      }

      // Ensure data is an array
      if (!Array.isArray(data)) {
        data = [];
      }

      setLawyers(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to search lawyers";
      setError(errorMsg);
      console.error("Error searching lawyers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering for price range
  const filteredLawyers = lawyers.filter((lawyer) => {
    let fee = 0;

    // Extract numeric value from fee_range string (e.g., "1000-2000" -> 1000)
    if (lawyer.fee_range) {
      const match = lawyer.fee_range.match(/\d+/);
      fee = match ? parseInt(match[0]) : 0;
    }

    const matchesPrice =
      priceRange === "all" ||
      (priceRange === "low" && fee < 1500) ||
      (priceRange === "medium" && fee >= 1500 && fee < 2500) ||
      (priceRange === "high" && fee >= 2500);

    return matchesPrice;
  });

  // Check if any filters are applied
  const hasFiltersApplied = searchQuery.trim() !== "" || specialty !== "all" || priceRange !== "all";

  // Return null while checking authorization
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900">Find a Lawyer</h2>
        <p className="text-gray-600 mt-1">Search and connect with qualified legal professionals</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                <SelectItem value="Criminal Law">Criminal Law</SelectItem>
                <SelectItem value="Consumer Rights">Consumer Rights</SelectItem>
                <SelectItem value="Family Law">Family Law</SelectItem>
                <SelectItem value="Property Law">Property Law</SelectItem>
                <SelectItem value="Corporate Law">Corporate Law</SelectItem>
                <SelectItem value="Labour Law">Labour Law</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="low">Under ₹1,500/hr</SelectItem>
                <SelectItem value="medium">₹1,500 - ₹2,500/hr</SelectItem>
                <SelectItem value="high">Above ₹2,500/hr</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Loading lawyers...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error loading lawyers: {error}</p>
          <Button
            size="sm"
            className="mt-2"
            onClick={loadInitialLawyers}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          <p className="text-sm text-gray-600">{filteredLawyers.length} lawyers found</p>

          {filteredLawyers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No lawyers found matching your criteria.</p>
              {hasFiltersApplied && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setSpecialty("all");
                    setPriceRange("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLawyers.map((lawyer) => (
                <Card key={lawyer.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                          {lawyer.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{lawyer.name}</h3>
                        <p className="text-sm text-blue-600 font-medium">{lawyer.specialization || 'Legal Professional'}</p>
                      </div>
                    </div>

                    {lawyer.bio && (
                      <p className="text-sm text-gray-600 mt-4">{lawyer.bio}</p>
                    )}

                    <div className="grid grid-cols-2 gap-3 mt-4 text-sm text-gray-600">
                      {lawyer.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{lawyer.rating || 'N/A'}</span>
                        </div>
                      )}
                      {lawyer.experience && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          <span>{lawyer.experience}</span>
                        </div>
                      )}
                      {lawyer.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{lawyer.location}</span>
                        </div>
                      )}
                      {lawyer.fee_range && (
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          <span>{lawyer.fee_range}/hr</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Badge
                        variant={lawyer.verified ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {lawyer.verified ? "Verified" : "Not Verified"}
                      </Badge>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" className="flex-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        Book
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
