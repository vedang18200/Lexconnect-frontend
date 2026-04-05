import { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Search, Star, Briefcase, Calendar, Loader, TrendingUp, Users, Award, MapPin } from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { lawyersAPI } from "../../services/api";
import { useCitizenRouteGuard } from "../../hooks/useCitizenRouteGuard";
import { LawyerProfileModal } from "../../components/LawyerProfileModal";
import type { LawyerResponse, LawyerProfileResponse } from "../../services/types";

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

  // Modal state
  const [selectedLawyer, setSelectedLawyer] = useState<LawyerProfileResponse | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

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
      // Use the new find-lawyers endpoint with verified filter
      const response = (await lawyersAPI.findLawyers({
        verified_only: true,
        limit: 20,
      })) as any;

      // Handle both array and paginated response
      const data = response.lawyers || response;
      setLawyers(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load lawyers";
      setError(errorMsg);
      console.error("Error loading lawyers:", err);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = (await lawyersAPI.findLawyers({
        query: searchQuery.trim() ? searchQuery : undefined,
        specialization: specialty !== "all" ? specialty : undefined,
        min_price: priceRange === "low" ? 0 : priceRange === "medium" ? 1500 : priceRange === "high" ? 2500 : undefined,
        max_price: priceRange === "low" ? 1500 : priceRange === "medium" ? 2500 : priceRange === "high" ? 999999 : undefined,
        verified_only: true,
        limit: 20,
      })) as any;

      // Handle both array and paginated response
      const data = response.lawyers || response;
      setLawyers(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to search lawyers";
      setError(errorMsg);
      console.error("Error searching lawyers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle View Full Profile button click
  const handleViewProfile = async (lawyerId: number) => {
    setProfileLoading(true);
    try {
      const profile = await lawyersAPI.getLawyerProfile(lawyerId) as LawyerProfileResponse;
      setSelectedLawyer(profile);
      setModalOpen(true);
    } catch (err) {
      console.error("Error fetching lawyer profile:", err);
      // Fallback: show the basic lawyer card in modal if detailed profile fails
      const basicLawyer = lawyers.find(l => l.id === lawyerId);
      if (basicLawyer) {
        setSelectedLawyer(basicLawyer as LawyerProfileResponse);
        setModalOpen(true);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // Results are already filtered by API (no need for client-side filtering)
  const filteredLawyers = lawyers;

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
            <div className="space-y-4">
              {filteredLawyers.map((lawyer) => (
                <Card key={lawyer.id} className="hover:shadow-lg transition-all duration-200 border border-gray-200">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-12 gap-6 items-start">
                      {/* Left Section: Avatar + Basic Info */}
                      <div className="col-span-12 lg:col-span-3">
                        <div className="flex gap-4">
                          <Avatar className="w-20 h-20 flex-shrink-0">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-semibold">
                              {lawyer.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">Adv. {lawyer.name}</h3>
                            <p className="text-sm text-blue-700 font-medium">{lawyer.specialization || 'Legal Professional'}</p>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mt-2 text-sm">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-semibold text-gray-900">{lawyer.rating?.toFixed(1) || '4.8'}</span>
                              <span className="text-gray-600">({lawyer.review_count || 124} reviews)</span>
                              {lawyer.availability && (
                                <Badge className="bg-green-100 text-green-800 text-xs">Available</Badge>
                              )}
                            </div>

                            {/* Experience, Location, Response Time */}
                            <div className="mt-2 space-y-1 text-sm text-gray-700">
                              {lawyer.experience && (
                                <div className="flex items-center gap-2">
                                  <Briefcase className="w-4 h-4 text-gray-500" />
                                  <span>{lawyer.experience} years experience</span>
                                </div>
                              )}
                              {lawyer.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-gray-500" />
                                  <span>{lawyer.location}</span>
                                </div>
                              )}
                              {lawyer.response_time && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span>{lawyer.response_time}</span>
                                </div>
                              )}
                            </div>

                            {/* Languages */}
                            {lawyer.languages && (
                              <div className="flex gap-2 mt-3 flex-wrap">
                                {(Array.isArray(lawyer.languages) ? lawyer.languages : lawyer.languages.split(',')).map((lang: string) => (
                                  <Badge key={lang} variant="outline" className="text-xs bg-white text-gray-800 border-gray-300">
                                    {lang.trim()}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Middle Section: Bio, Stats, Specializations, Available Via */}
                      <div className="col-span-12 lg:col-span-4">
                        <div className="space-y-4">
                          {/* Bio */}
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {lawyer.bio || 'Experienced legal professional dedicated to providing quality legal services.'}
                          </p>

                          {/* Statistics Grid - with Icon Badges and Labels */}
                          <div className="grid grid-cols-3 gap-4">
                            {/* Cases Won */}
                            <div className="text-center bg-blue-50 p-3 rounded-lg">
                              <div className="flex justify-center mb-2">
                                <div className="bg-blue-100 rounded-full p-2">
                                  <Award className="w-4 h-4 text-blue-600" />
                                </div>
                              </div>
                              <div className="text-lg font-bold text-gray-900">{lawyer.cases_won || lawyer.total_clients || '0'}</div>
                              <div className="text-xs text-gray-600 mt-1">Cases Won</div>
                            </div>
                            {/* Success Rate */}
                            <div className="text-center bg-green-50 p-3 rounded-lg">
                              <div className="flex justify-center mb-2">
                                <div className="bg-green-100 rounded-full p-2">
                                  <TrendingUp className="w-4 h-4 text-green-600" />
                                </div>
                              </div>
                              <div className="text-lg font-bold text-gray-900">{lawyer.success_rate?.toFixed(0) || '85'}%</div>
                              <div className="text-xs text-gray-600 mt-1">Success Rate</div>
                            </div>
                            {/* Total Cases */}
                            <div className="text-center bg-purple-50 p-3 rounded-lg">
                              <div className="flex justify-center mb-2">
                                <div className="bg-purple-100 rounded-full p-2">
                                  <Users className="w-4 h-4 text-purple-600" />
                                </div>
                              </div>
                              <div className="text-lg font-bold text-gray-900">{lawyer.total_cases || '0'}</div>
                              <div className="text-xs text-gray-600 mt-1">Total Cases</div>
                            </div>
                          </div>

                          {/* Specializations */}
                          {lawyer.specializations && lawyer.specializations.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-900 mb-2">Specializations:</p>
                              <div className="flex flex-wrap gap-2">
                                {lawyer.specializations.map((spec: string) => (
                                  <Badge key={spec} variant="outline" className="text-sm bg-white text-blue-700 border-blue-300">
                                    {spec}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Available Via */}
                          {lawyer.available_via && lawyer.available_via.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-900 mb-2">Available via:</p>
                              <div className="flex flex-wrap gap-2">
                                {lawyer.available_via.map((method: string) => (
                                  <Badge key={method} variant="outline" className="text-sm bg-white text-gray-700 border-gray-300">
                                    {method}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Section: Price & Actions */}
                      <div className="col-span-12 lg:col-span-5">
                        <div className="space-y-3">
                          {/* Price Section - With Background */}
                          <div className="rounded-lg p-4 text-right" style={{backgroundColor: '#f0f9ff'}}>
                            <div className="text-3xl font-bold text-gray-900">
                              ₹ {lawyer.fee_per_hour || (lawyer.fee_range?.match(/\d+/)?.[0] || '2000')}
                              <span className="text-sm text-gray-600 font-normal"> /hour</span>
                            </div>
                            {lawyer.next_slot_available && (
                              <p className="text-xs text-green-600 font-medium mt-2">Next slot: {lawyer.next_slot_available}</p>
                            )}
                          </div>

                          {/* Book Consultation Button */}
                          <Button size="lg" className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded">
                            <Calendar className="w-4 h-4 mr-2" />
                            Book Consultation
                          </Button>

                          {/* View Full Profile Link */}
                          <button
                            onClick={() => handleViewProfile(lawyer.id)}
                            disabled={profileLoading}
                            className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50 py-2"
                          >
                            {profileLoading ? "Loading..." : "View Full Profile"}
                          </button>

                          {/* Achievement Badge */}
                          {lawyer.top_achievement && (
                            <div className="border-t border-gray-200 pt-3 mt-2">
                              <div className="flex items-start gap-2">
                                <span className="text-lg flex-shrink-0">⭐</span>
                                <div>
                                  <p className="text-xs font-semibold text-gray-900">Top Achievement</p>
                                  <p className="text-xs text-gray-600">{lawyer.top_achievement}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Lawyer Profile Modal */}
      <LawyerProfileModal
        isOpen={modalOpen}
        lawyer={selectedLawyer}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
