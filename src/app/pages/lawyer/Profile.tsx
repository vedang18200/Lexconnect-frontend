export function LawyerProfile() {

  // Static profile data
  const profile = {
    name: "Jolly Mishra",
    specialization: "Criminal & Corporate Law",
    experience: "8 Years",
    email: "jolly.mishra@lawfirm.com",
    phone: "+91 9876543210",
    location: "Mumbai, India",
    barCouncilId: "BCI123456",
    bio: "Experienced lawyer specializing in criminal defense and corporate litigation with a strong track record of successful cases.",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-900">
        Professional Profile
      </h2>
      <p className="text-gray-600">
        Manage your professional information and credentials
      </p>

      <div className="p-6 border rounded-xl shadow-sm bg-white space-y-4">
        
        {/* Name & Specialization */}
        <div>
          <h3 className="text-2xl font-semibold">{profile.name}</h3>
          <p className="text-gray-600">{profile.specialization}</p>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4">
          <p className="text-gray-700">
            <span className="font-medium">Experience:</span> {profile.experience}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Bar Council ID:</span> {profile.barCouncilId}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Email:</span> {profile.email}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Phone:</span> {profile.phone}
          </p>
          <p className="text-gray-700 col-span-2">
            <span className="font-medium">Location:</span> {profile.location}
          </p>
        </div>

        {/* Bio */}
        <div>
          <h4 className="font-medium text-gray-900">About</h4>
          <p className="text-gray-600 text-sm mt-1">{profile.bio}</p>
        </div>

        {/* Action Button (future edit feature) */}
        <button className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
          Edit Profile
        </button>

      </div>
    </div>
  );
}
