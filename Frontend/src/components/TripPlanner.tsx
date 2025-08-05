import { useEffect, useState } from "react";
import { Plus, MapPin, Calendar, Users, DollarSign, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import axios from "@/api/axiosInstance";

interface TripData {
  tripId?: number; // Ensure tripId is optional
  destination: string;
  startDate: string;
  endDate: string;
  budget: number | null;
  transport: string[];
}

interface DayActivity {
  id: string;
  time: string;
  activity: string;
  location: string;
  notes?: string;
  estimatedCost?: number;
  date?: string; // Needed for grouping on fetch
}

interface DayPlan {
  date: string;
  activities: DayActivity[];
}

const TripPlanner = ({ tripData }: { tripData: TripData }) => {
  const [itinerary, setItinerary] = useState<DayPlan[]>([]);
  const [newActivity, setNewActivity] = useState({
    time: "",
    activity: "",
    location: "",
    notes: "",
    estimatedCost: ""
  });
  const [selectedDate, setSelectedDate] = useState("");

  const generateDateRange = () => {
    const start = new Date(tripData.startDate);
    const end = new Date(tripData.endDate);
    const dates = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split("T")[0]);
    }
    return dates;
  };

  const dates = generateDateRange();

  useEffect(() => {
    const fetchActivities = async () => {
      if (!tripData?.tripId) return;
      try {
        const response = await axios.get(`http://localhost:1833/api/activities/${tripData.tripId}`);
        const activities: DayActivity[] = response.data.activities;

        const groupedByDate: Record<string, DayActivity[]> = {};
        activities.forEach((act) => {
          if (!act.date) return;
          if (!groupedByDate[act.date]) groupedByDate[act.date] = [];
          groupedByDate[act.date].push(act);
        });

        const result: DayPlan[] = Object.keys(groupedByDate).map((date) => ({
          date,
          activities: groupedByDate[date]
        }));

        setItinerary(result);
      } catch (err) {
        console.error("Error loading activities:", err);
      }
    };

    fetchActivities();
  }, [tripData?.tripId]);

  const addActivity = async () => {
    if (!selectedDate || !newActivity.activity) return;

    try {
      const response = await axios.post("http://localhost:1833/api/activities", {
        trip_id: tripData.tripId,
        date: selectedDate,
        time: newActivity.time,
        activity: newActivity.activity,
        location: newActivity.location,
        notes: newActivity.notes,
        estimated_cost: newActivity.estimatedCost ? parseFloat(newActivity.estimatedCost) : null
      });

      const activity: DayActivity = {
        id: response.data.activityId,
        ...newActivity,
        estimatedCost: newActivity.estimatedCost ? parseFloat(newActivity.estimatedCost) : undefined
      };

      setItinerary((prev) => {
        const existingDay = prev.find((day) => day.date === selectedDate);
        if (existingDay) {
          return prev.map((day) =>
            day.date === selectedDate
              ? { ...day, activities: [...day.activities, activity] }
              : day
          );
        } else {
          return [...prev, { date: selectedDate, activities: [activity] }];
        }
      });

      setNewActivity({
        time: "",
        activity: "",
        location: "",
        notes: "",
        estimatedCost: ""
      });
    } catch (err) {
      console.error("Error adding activity:", err);
    }
  };

  const removeActivity = async (date: string, activityId: string) => {
    try {
      await axios.delete(`http://localhost:1833/api/activities/${activityId}`);

      setItinerary((prev) =>
        prev
          .map((day) =>
            day.date === date
              ? {
                  ...day,
                  activities: day.activities.filter((a) => a.id !== activityId)
                }
              : day
          )
          .filter((day) => day.activities.length > 0)
      );
    } catch (err) {
      console.error("Error removing activity:", err);
    }
  };

  const getTotalCost = () => {
    return itinerary.reduce((total, day) => {
      return (
        total +
        day.activities.reduce((dayTotal, activity) => {
          return dayTotal + (activity.estimatedCost || 0);
        }, 0)
      );
    }, 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      {/* Trip Overview */}
      <Card className="shadow-card-travel bg-gradient-card">
        <CardHeader>
          <CardTitle className="text-2xl text-travel-blue flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            Trip to {tripData.destination}
          </CardTitle>
        </CardHeader>
        {selectedDate && (
          <p className="text-sm text-muted-foreground">
            Selected Date: <span className="font-medium">{formatDate(selectedDate)}</span>
          </p>
        )}

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-travel-orange" />
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-semibold">{dates.length} days</p>
            </div>
            <div className="text-center">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-travel-orange" />
              <p className="text-sm text-muted-foreground">Budget</p>
              <p className="font-semibold">${tripData.budget || "No limit"}</p>
            </div>
            <div className="text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-travel-orange" />
              <p className="text-sm text-muted-foreground">Planned Cost</p>
              <p className="font-semibold">${getTotalCost()}</p>
            </div>
            <div className="text-center">
              <div className="w-6 h-6 mx-auto mb-2 flex gap-1">
                {tripData.transport.map((t) => (
                  <div key={t} className="w-2 h-6 bg-travel-orange rounded"></div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Transport</p>
              <p className="font-semibold">{tripData.transport.join(", ")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Activity Form */}
      <Card className="shadow-card-travel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-travel-blue" />
            Add Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Select a date</option>
                {dates.map((date) => (
                  <option key={date} value={date}>
                    {formatDate(date)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Time</label>
              <Input
                type="time"
                value={newActivity.time}
                onChange={(e) => setNewActivity((prev) => ({ ...prev, time: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Activity</label>
              <Input
                placeholder="What will you do?"
                value={newActivity.activity}
                onChange={(e) => setNewActivity((prev) => ({ ...prev, activity: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                placeholder="Where?"
                value={newActivity.location}
                onChange={(e) => setNewActivity((prev) => ({ ...prev, location: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                placeholder="Additional details..."
                value={newActivity.notes}
                onChange={(e) => setNewActivity((prev) => ({ ...prev, notes: e.target.value }))}
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Estimated Cost ($)</label>
              <Input
                type="number"
                placeholder="0"
                value={newActivity.estimatedCost}
                onChange={(e) => setNewActivity((prev) => ({ ...prev, estimatedCost: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          <Button
            onClick={addActivity}
            variant="travel"
            className="w-full"
            disabled={!selectedDate || !newActivity.activity}
          >
            Add Activity
          </Button>
        </CardContent>
      </Card>

      {/* Itinerary Display */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-travel-blue">Your Itinerary</h3>
        {itinerary.length === 0 ? ( 
          <Card className="shadow-card-travel">
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Start planning your trip by adding activities above!</p>
            </CardContent>
          </Card>
        ) : (
          itinerary.map((day) => (
            <Card key={day.date} className="shadow-card-travel">
              <CardHeader>
                <CardTitle className="text-lg text-travel-blue">
                  {formatDate(day.date)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {day.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start justify-between p-3 border rounded-lg bg-gradient-card"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {activity.time && (
                            <Badge variant="outline" className="text-xs">
                              {activity.time}
                            </Badge>
                          )}
                          <h4 className="font-semibold">{activity.activity}</h4>
                          {activity.estimatedCost && (
                            <Badge variant="secondary" className="text-xs">
                              ${activity.estimatedCost}
                            </Badge>
                          )}
                        </div>
                        {activity.location && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {activity.location}
                          </p>
                        )}
                        {activity.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{activity.notes}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeActivity(day.date, activity.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TripPlanner;
