import { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Loader, Check, AlertCircle } from "lucide-react";
import { citizensAPI } from "../../services/api";
import { useCitizenRouteGuard } from "../../hooks/useCitizenRouteGuard";
import type { CitizenProfileResponse } from "../../services/types";

export function CitizenProfile() {
  // Protect route - only citizens can access
  const isAuthorized = useCitizenRouteGuard();

  const [profile, setProfile] = useState<CitizenProfileResponse | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    bio: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await citizensAPI.getProfile()) as CitizenProfileResponse;
      setProfile(data);
      setFormData({
        full_name: data.full_name || "",
        date_of_birth: data.date_of_birth || "",
        gender: data.gender || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
        bio: data.bio || "",
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load profile";
      setError(errorMsg);
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    if (!formData.full_name.trim()) {
      setError("Full name is required");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedProfile = (await citizensAPI.updateProfile(
        formData
      )) as CitizenProfileResponse;
      setProfile(updatedProfile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save profile";
      setError(errorMsg);
      console.error("Error saving profile:", err);
    } finally {
      setSaving(false);
    }
  };

  // Return null while checking authorization
  if (!isAuthorized) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900">My Profile</h2>
        <p className="text-gray-600 mt-1">Manage your personal information</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setError(null)}
            className="ml-auto"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-green-700">Profile updated successfully!</p>
        </div>
      )}

      {/* Profile Header */}
      {profile && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src={profile.profile_picture_url || ""}
                  alt={profile.full_name || "Profile"}
                />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">
                  {(profile.full_name || "U")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-900">
                  {profile.full_name || "No name set"}
                </h3>
                <p className="text-gray-600 mt-1">Citizen Account</p>

                {/* KYC Status */}
                <div className="mt-3">
                  {profile.is_kyc_verified ? (
                    <Badge className="bg-green-100 text-green-700 border-0">
                      ✓ KYC Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="border border-yellow-300">
                      ⚠ KYC Not Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Edit Profile</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Full Name */}
            <div>
              <Label htmlFor="full_name" className="text-gray-700 font-medium">
                Full Name *
              </Label>
              <Input
                id="full_name"
                name="full_name"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <Label htmlFor="date_of_birth" className="text-gray-700 font-medium">
                Date of Birth
              </Label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>

            {/* Gender */}
            <div>
              <Label htmlFor="gender" className="text-gray-700 font-medium">
                Gender
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address" className="text-gray-700 font-medium">
                Address
              </Label>
              <Input
                id="address"
                name="address"
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>

            {/* City */}
            <div>
              <Label htmlFor="city" className="text-gray-700 font-medium">
                City
              </Label>
              <Input
                id="city"
                name="city"
                placeholder="Enter your city"
                value={formData.city}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>

            {/* State */}
            <div>
              <Label htmlFor="state" className="text-gray-700 font-medium">
                State
              </Label>
              <Input
                id="state"
                name="state"
                placeholder="Enter your state"
                value={formData.state}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>

            {/* Pincode */}
            <div>
              <Label htmlFor="pincode" className="text-gray-700 font-medium">
                Pincode
              </Label>
              <Input
                id="pincode"
                name="pincode"
                placeholder="Enter your pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <Label htmlFor="bio" className="text-gray-700 font-medium">
              Bio
            </Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={handleInputChange}
              className="mt-1 h-24"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.bio.length} / 500 characters
            </p>
          </div>

          {/* Save Button */}
          <div className="flex gap-3">
            <Button
              onClick={handleSaveProfile}
              disabled={saving || loading}
              className="flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Profile
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={loadProfile}
              disabled={saving || loading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      {profile && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Account Type</p>
                <p className="text-gray-900 font-medium">Citizen</p>
              </div>
              <div>
                <p className="text-gray-600">Account Created</p>
                <p className="text-gray-900 font-medium">
                  {new Date(profile.created_at).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Last Updated</p>
                <p className="text-gray-900 font-medium">
                  {profile.updated_at
                    ? new Date(profile.updated_at).toLocaleDateString("en-IN")
                    : "Never"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">KYC Status</p>
                <p className="text-gray-900 font-medium">
                  {profile.is_kyc_verified ? "Verified" : "Not Verified"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
