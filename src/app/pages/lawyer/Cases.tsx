export function LawyerCases() {

  // Static data
  const cases = [
    {
      id: 1,
      title: "Property Dispute",
      client: "Rahul Sharma",
      status: "Open",
      court: "Mumbai High Court",
      nextHearing: "2026-05-02",
    },
    {
      id: 2,
      title: "Divorce Case",
      client: "Priya Mehta",
      status: "In Progress",
      court: "Family Court",
      nextHearing: "2026-04-30",
    },
    {
      id: 3,
      title: "Corporate Fraud",
      client: "Amit Verma",
      status: "Closed",
      court: "Supreme Court",
      nextHearing: "Closed",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-900">Cases</h2>
      <p className="text-gray-600">Manage your client cases</p>

      <div className="grid gap-4">
        {cases.map((c) => (
          <div
            key={c.id}
            className="p-4 border rounded-xl shadow-sm bg-white"
          >
            <h3 className="text-xl font-semibold">{c.title}</h3>
            <p className="text-gray-600">Client: {c.client}</p>
            <p className="text-gray-600">Court: {c.court}</p>
            <p className="text-gray-600">
              Next Hearing: {c.nextHearing}
            </p>

            <span
              className={`inline-block mt-2 px-3 py-1 text-sm rounded-full ${
                c.status === "Open"
                  ? "bg-green-100 text-green-700"
                  : c.status === "In Progress"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
