export function LawyerCalendar() {

  // Static events data
  const events = [
    {
      id: 1,
      title: "Hearing - Property Dispute",
      type: "Court",
      date: "2026-04-26",
      time: "10:30 AM",
      location: "Mumbai High Court",
    },
    {
      id: 2,
      title: "Client Meeting - Priya Mehta",
      type: "Meeting",
      date: "2026-04-27",
      time: "02:00 PM",
      location: "Office",
    },
    {
      id: 3,
      title: "Deadline - Document Submission",
      type: "Deadline",
      date: "2026-04-28",
      time: "05:00 PM",
      location: "Online",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-900">Calendar</h2>
      <p className="text-gray-600">Manage your schedule and availability</p>

      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="p-4 border rounded-xl shadow-sm bg-white flex justify-between items-center"
          >
            <div>
              <h3 className="text-lg font-semibold">{event.title}</h3>
              <p className="text-gray-600">
                {event.date} • {event.time}
              </p>
              <p className="text-gray-500 text-sm">
                {event.location}
              </p>
            </div>

            <span
              className={`px-3 py-1 text-sm rounded-full ${
                event.type === "Court"
                  ? "bg-red-100 text-red-700"
                  : event.type === "Meeting"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {event.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
