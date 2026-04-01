import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Scale, User, Briefcase, Users, ArrowLeft } from "lucide-react";

type Role = "citizen" | "lawyer" | "social-worker";

export function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();

  // Common fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Citizen specific
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Lawyer specific
  const [barCouncilId, setBarCouncilId] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [qualification, setQualification] = useState("");
  const [bio, setBio] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);

  // Social Worker specific
  const [agencyName, setAgencyName] = useState("");
  const [agencyId, setAgencyId] = useState("");
  const [designation, setDesignation] = useState("");

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [localError, setLocalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async (role: Role) => {
    setLocalError("");
    setSuccessMessage("");

    if (!fullName || !email || !password || !confirmPassword || !phone || !address) {
      setLocalError("Please fill all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    if (!termsAccepted) {
      setLocalError("Please accept the terms and conditions");
      return;
    }

    try {
      await register({
        username: fullName,
        email,
        user_type: role,
        phone,
        location: address,
        language: role === "lawyer" && languages.length > 0 ? languages.join(", ") : "English",
        password,
      });

      setSuccessMessage("Registration successful. You can now login.");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((item) => item !== lang) : [...prev, lang]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Link to="/login" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900">Join Lexconnect</h1>
          <p className="text-gray-600 mt-2">Create your account and access legal services</p>
        </div>

        {(error || localError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error || localError}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        <Tabs defaultValue="citizen" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="citizen" className="gap-2">
              <User className="w-4 h-4" />
              Citizen
            </TabsTrigger>
            <TabsTrigger value="lawyer" className="gap-2">
              <Briefcase className="w-4 h-4" />
              Lawyer
            </TabsTrigger>
            <TabsTrigger value="social-worker" className="gap-2">
              <Users className="w-4 h-4" />
              Social Worker
            </TabsTrigger>
          </TabsList>

          <TabsContent value="citizen">
            <Card>
              <CardHeader>
                <CardTitle>Citizen Registration</CardTitle>
                <CardDescription>Register to access legal services and find lawyers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="citizen-name">Full Name *</Label>
                    <Input id="citizen-name" placeholder="Priya Sharma" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="citizen-email">Email *</Label>
                    <Input id="citizen-email" type="email" placeholder="priya@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="citizen-phone">Phone Number *</Label>
                    <Input id="citizen-phone" type="tel" placeholder="7756882618" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="citizen-dob">Date of Birth *</Label>
                    <Input id="citizen-dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="citizen-address">Address *</Label>
                  <Textarea id="citizen-address" placeholder="Enter your complete address" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="citizen-password">Password *</Label>
                    <Input id="citizen-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="citizen-confirm-password">Confirm Password *</Label>
                    <Input id="citizen-confirm-password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="citizen-terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="citizen-terms" className="text-sm text-gray-700 cursor-pointer">
                    I accept the terms and conditions and privacy policy
                  </label>
                </div>

                <Button className="w-full" disabled={isLoading} onClick={() => handleRegister("citizen")}>Create Citizen Account</Button>

                <p className="text-xs text-gray-500 text-center">
                  Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link>
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lawyer">
            <Card>
              <CardHeader>
                <CardTitle>Lawyer Registration</CardTitle>
                <CardDescription>Join our network of legal professionals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lawyer-name">Full Name *</Label>
                    <Input id="lawyer-name" placeholder="Adv. Rajesh Kumar" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lawyer-email">Email *</Label>
                    <Input id="lawyer-email" type="email" placeholder="rajesh@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lawyer-phone">Phone Number *</Label>
                    <Input id="lawyer-phone" type="tel" placeholder="7756882618" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lawyer-bar-id">Bar Council ID *</Label>
                    <Input id="lawyer-bar-id" placeholder="BAR/2024/12345" value={barCouncilId} onChange={(e) => setBarCouncilId(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lawyer-specialty">Specialty *</Label>
                    <Select value={specialty} onValueChange={setSpecialty}>
                      <SelectTrigger id="lawyer-specialty">
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Criminal Law">Criminal Law</SelectItem>
                        <SelectItem value="Civil Law">Civil Law</SelectItem>
                        <SelectItem value="Family Law">Family Law</SelectItem>
                        <SelectItem value="Corporate Law">Corporate Law</SelectItem>
                        <SelectItem value="Property Law">Property Law</SelectItem>
                        <SelectItem value="Consumer Rights">Consumer Rights</SelectItem>
                        <SelectItem value="Labour Law">Labour Law</SelectItem>
                        <SelectItem value="Tax Law">Tax Law</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lawyer-experience">Years of Experience *</Label>
                    <Input id="lawyer-experience" type="number" placeholder="10" value={experience} onChange={(e) => setExperience(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lawyer-qualification">Qualification *</Label>
                    <Input id="lawyer-qualification" placeholder="LLB, LLM" value={qualification} onChange={(e) => setQualification(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lawyer-rate">Hourly Rate (INR) *</Label>
                    <Input id="lawyer-rate" type="number" placeholder="2000" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lawyer-address">Office Address *</Label>
                  <Textarea id="lawyer-address" placeholder="Enter your office address" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lawyer-bio">Professional Bio *</Label>
                  <Textarea id="lawyer-bio" placeholder="Brief description of your expertise and experience" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} required />
                </div>

                <div className="space-y-2">
                  <Label>Languages Spoken *</Label>
                  <div className="flex flex-wrap gap-2">
                    {["English", "Hindi", "Bengali", "Tamil", "Telugu", "Marathi", "Gujarati", "Kannada", "Malayalam", "Punjabi"].map((lang) => (
                      <Button
                        key={lang}
                        type="button"
                        variant={languages.includes(lang) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleLanguage(lang)}
                      >
                        {lang}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lawyer-password">Password *</Label>
                    <Input id="lawyer-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lawyer-confirm-password">Confirm Password *</Label>
                    <Input id="lawyer-confirm-password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="lawyer-terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="lawyer-terms" className="text-sm text-gray-700 cursor-pointer">
                    I accept the terms and conditions and verify that my credentials are authentic
                  </label>
                </div>

                <Button className="w-full" disabled={isLoading} onClick={() => handleRegister("lawyer")}>Create Lawyer Account</Button>

                <p className="text-xs text-gray-500 text-center">
                  Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link>
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social-worker">
            <Card>
              <CardHeader>
                <CardTitle>Social Worker Registration</CardTitle>
                <CardDescription>Register to help connect clients with legal services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sw-name">Full Name *</Label>
                    <Input id="sw-name" placeholder="Meera Singh" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sw-email">Email *</Label>
                    <Input id="sw-email" type="email" placeholder="meera@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sw-phone">Phone Number *</Label>
                    <Input id="sw-phone" type="tel" placeholder="7756882618" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sw-designation">Designation *</Label>
                    <Input id="sw-designation" placeholder="Senior Social Worker" value={designation} onChange={(e) => setDesignation(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sw-agency">Agency Name *</Label>
                    <Input id="sw-agency" placeholder="Legal Aid Society" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sw-agency-id">Agency ID *</Label>
                    <Input id="sw-agency-id" placeholder="AG/2024/001" value={agencyId} onChange={(e) => setAgencyId(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sw-address">Office Address *</Label>
                  <Textarea id="sw-address" placeholder="Enter your office address" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sw-password">Password *</Label>
                    <Input id="sw-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sw-confirm-password">Confirm Password *</Label>
                    <Input id="sw-confirm-password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="sw-terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="sw-terms" className="text-sm text-gray-700 cursor-pointer">
                    I accept the terms and conditions and verify my agency affiliation
                  </label>
                </div>

                <Button className="w-full" disabled={isLoading} onClick={() => handleRegister("social-worker")}>Create Social Worker Account</Button>

                <p className="text-xs text-gray-500 text-center">
                  Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link>
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
