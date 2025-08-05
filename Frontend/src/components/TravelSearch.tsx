import { useState } from "react";
import { Search, MapPin, Calendar, DollarSign, Plane, Train, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "@/api/axiosInstance";

const TravelSearch = ({ onSearch }: { onSearch: (data: any) => void }) => {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [transport, setTransport] = useState<string[]>([]);

  const transportOptions = [
    { id: "flight", icon: Plane, label: "Flight" },
    { id: "train", icon: Train, label: "Train" },
    { id: "car", icon: Car, label: "Car" },
  ];

  const toggleTransport = (transportId: string) => {
    setTransport(prev =>
      prev.includes(transportId)
        ? prev.filter(t => t !== transportId)
        : [...prev, transportId]
    );
  };

  const handleSearch = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const user_id = user.id;

      const response = await axios.post('http://localhost:1833/api/trips', {
        user_id,
        destination,
        startDate,
        endDate,
        budget: budget ? parseInt(budget) : null,
        transport
      });

      const tripId = response.data.tripId;

      onSearch({
        destination,
        startDate,
        endDate,
        budget: budget ? parseInt(budget) : null,
        transport,
        tripId,
        user_id
      });
    } catch (error) {
      console.error("Error creating trip:", error);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-card-travel bg-gradient-card">
      <CardContent className="p-6 space-y-6">
        {/* Destination Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4 text-travel-blue" />
            Where do you want to go?
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search destinations..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-travel-blue" />
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-travel-blue" />
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-travel-blue" />
            Budget (optional)
          </label>
          <Input
            type="number"
            placeholder="Enter your budget in USD"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="h-12"
          />
        </div>

        {/* Transportation */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Preferred Transportation</label>
          <div className="flex flex-wrap gap-3">
            {transportOptions.map(({ id, icon: Icon, label }) => (
              <Badge
                key={id}
                variant={transport.includes(id) ? "default" : "outline"}
                className={`cursor-pointer p-3 transition-all duration-200 hover:scale-105 ${
                  transport.includes(id)
                    ? "bg-travel-blue hover:bg-travel-blue/90"
                    : "hover:bg-travel-blue/10"
                }`}
                onClick={() => toggleTransport(id)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          className="w-full h-12 text-lg"
          variant="travel"
          disabled={!destination || !startDate || !endDate}
        >
          <Search className="w-5 h-5 mr-2" />
          Plan My Trip
        </Button>
      </CardContent>
    </Card>
  );
};

export default TravelSearch;
