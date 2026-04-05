import { useState } from "react";
import { Star, Phone, Mail, MapPin, Award } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import type { LawyerProfileResponse } from "../services/types";

interface LawyerProfileModalProps {
  isOpen: boolean;
  lawyer: LawyerProfileResponse | null;
  onClose: () => void;
}

export function LawyerProfileModal({ isOpen, lawyer, onClose }: LawyerProfileModalProps) {
  const [selectedTab, setSelectedTab] = useState("overview");

  if (!lawyer) return null;

  const initials = lawyer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between w-full">
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">Adv. {lawyer.name}</DialogTitle>
                <p className="text-sm text-gray-600 mt-1">{lawyer.specialization}</p>
                <div className="flex items-center gap-2 mt-2">
                  {lawyer.verified && (
                    <Badge className="bg-green-100 text-green-800">Verified</Badge>
                  )}
                  {lawyer.availability && (
                    <Badge className="bg-blue-100 text-blue-800">{lawyer.availability}</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Bio */}
            {lawyer.bio && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{lawyer.bio}</p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {lawyer.experience || 0}
                </div>
                <div className="text-xs text-gray-600">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {lawyer.rating?.toFixed(1) || '0'}
                </div>
                <div className="text-xs text-gray-600">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {lawyer.success_rate?.toFixed(0) || '0'}%
                </div>
                <div className="text-xs text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {lawyer.cases_won || 0}
                </div>
                <div className="text-xs text-gray-600">Cases Won</div>
              </div>
            </div>

            {/* Specializations */}
            {lawyer.specializations && lawyer.specializations.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {lawyer.specializations.map((spec) => (
                    <Badge key={spec} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {lawyer.languages && (Array.isArray(lawyer.languages) ? lawyer.languages.length > 0 : lawyer.languages) && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(lawyer.languages) ? lawyer.languages : lawyer.languages?.split(',') || []).map((lang: string) => (
                    <Badge key={lang} variant="secondary" className="bg-gray-100 text-gray-700">
                      {lang.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {lawyer.education && lawyer.education.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Education & Credentials</h3>
                <div className="space-y-2">
                  {lawyer.education.map((edu, idx) => (
                    <div key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{edu}</span>
                    </div>
                  ))}
                  {lawyer.credentials && (
                    <div className="text-sm text-gray-700 flex items-start gap-2 mt-3">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{lawyer.credentials}</span>
                    </div>
                  )}
                  {lawyer.bar_council_id && (
                    <div className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Bar Council ID: {lawyer.bar_council_id}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            {/* Rating Summary */}
            {lawyer.reviews_summary && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-gray-900">
                    {lawyer.reviews_summary?.average_rating?.toFixed(1) || '0'}
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(lawyer.reviews_summary?.average_rating || 0)
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Based on {lawyer.reviews_summary?.total_reviews} reviews
                  </p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2 mt-4">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-6">{rating}★</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded">
                        <div
                          className="h-full bg-yellow-500 rounded"
                          style={{
                            width: `${
                              ((lawyer.reviews_summary?.rating_distribution?.[rating] || 0) /
                                (lawyer.reviews_summary?.total_reviews || 1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">
                        {lawyer.reviews_summary?.rating_distribution?.[rating] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Individual Reviews */}
            {lawyer.reviews_data && lawyer.reviews_data.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Client Reviews</h3>
                {lawyer.reviews_data.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{review.title}</p>
                        <p className="text-sm text-gray-600">{review.citizen_name}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{review.review_text}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600">No reviews yet</p>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4">
            {lawyer.achievements_data && lawyer.achievements_data.length > 0 ? (
              <div className="space-y-3">
                {lawyer.achievements_data.map((achievement, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Award className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{achievement.title}</p>
                      <p className="text-sm text-gray-600">
                        {achievement.issuer} • {achievement.year}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600">No achievements listed</p>
            )}
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-4">
            <div className="space-y-3">
              {lawyer.email && (
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{lawyer.email}</p>
                  </div>
                </div>
              )}

              {lawyer.phone && (
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{lawyer.phone}</p>
                  </div>
                </div>
              )}

              {lawyer.location && (
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-900">{lawyer.location}</p>
                  </div>
                </div>
              )}

              {lawyer.availability && (
                <div className="p-3 border rounded-lg bg-green-50">
                  <p className="text-sm text-gray-600">Availability</p>
                  <p className="font-medium text-gray-900">{lawyer.availability}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </Button>
              <Button variant="outline">Book Consultation</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
