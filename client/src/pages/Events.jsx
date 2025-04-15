export default function Events() {
    const events = [
      { name: "Summer Championship", date: "10th June - 15th June", venue: "Stadium A" },
      { name: "Winter Cup", date: "5th Dec - 10th Dec", venue: "Arena B" },
      { name: "Spring Tournament", date: "20th March - 25th March", venue: "Field C" }
    ];
  
    return (
      <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-6">Upcoming Events</h2>
        <div className="w-full max-w-3xl space-y-4">
          {events.map((event, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">{event.name}</h3>
              <p className="text-gray-600">Duration: {event.date}</p>
              <p className="text-gray-600">Venue: {event.venue}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }