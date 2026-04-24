export function LawyerClients() {

  // Static data
  const clients = [
    {
      id: 1,
      name: "Rahul Sharma",
      email: "rahul.sharma@gmail.com",
      phone: "+91 9876543210",
      cases: 2,
      status: "Active",
    },
    {
      id: 2,
      name: "Priya Mehta",
      email: "priya.mehta@gmail.com",
      phone: "+91 9123456780",
      cases: 1,
      status: "Inactive",
    },
    {
      id: 3,
      name: "Amit Verma",
      email: "amit.verma@gmail.com",
      phone: "+91 9988776655",
      cases: 3,
      status: "Active",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-900">Clients</h2>
      <p className="text-gray-600">View and manage your clients</p>

      <div className="grid gap-4">
        {clients.map((client) => (
          <div
            key={client.id}
            className="p-4 border rounded-xl shadow-sm bg-white"
          >
            <h3 className="text-xl font-semibold">{client.name}</h3>

            <p className="text-gray-600">Email: {client.email}</p>
            <p className="text-gray-600">Phone: {client.phone}</p>
            <p className="text-gray-600">Cases: {client.cases}</p>

            <span
              className={`inline-block mt-2 px-3 py-1 text-sm rounded-full ${
                client.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {client.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
