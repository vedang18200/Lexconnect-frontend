export function LawyerBilling() {

  // Static invoice data
  const invoices = [
    {
      id: 1,
      client: "Rahul Sharma",
      case: "Property Dispute",
      amount: 50000,
      status: "Paid",
      date: "2026-04-10",
    },
    {
      id: 2,
      client: "Priya Mehta",
      case: "Divorce Case",
      amount: 30000,
      status: "Pending",
      date: "2026-04-18",
    },
    {
      id: 3,
      client: "Amit Verma",
      case: "Corporate Fraud",
      amount: 75000,
      status: "Overdue",
      date: "2026-04-05",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-900">
        Billing & Invoices
      </h2>
      <p className="text-gray-600">
        Track earnings and generate invoices
      </p>

      <div className="grid gap-4">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="p-4 border rounded-xl shadow-sm bg-white flex justify-between items-center"
          >
            <div>
              <h3 className="text-lg font-semibold">{inv.client}</h3>
              <p className="text-gray-600">Case: {inv.case}</p>
              <p className="text-gray-500 text-sm">Date: {inv.date}</p>
              <p className="text-gray-900 font-medium mt-1">
                ₹{inv.amount.toLocaleString()}
              </p>
            </div>

            <span
              className={`px-3 py-1 text-sm rounded-full ${
                inv.status === "Paid"
                  ? "bg-green-100 text-green-700"
                  : inv.status === "Pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {inv.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
