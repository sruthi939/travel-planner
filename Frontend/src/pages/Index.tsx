import { useState, useEffect } from "react";
import { MapPin, Calendar, Compass, Star, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TravelSearch from "@/components/TravelSearch";
import TripPlanner from "@/components/TripPlanner";
import heroImage from "@/assets/hero-travel.jpg";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<"search" | "plan">("search");
  const [tripData, setTripData] = useState<any>(null); // ✅ fixed type
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); // ✅ for logout button

  const navigate = useNavigate();

  // ✅ Authentication check
  useEffect(() => {
    const isLogged = localStorage.getItem("isLoggedIn");
    const user = localStorage.getItem("user");

    if (!isLogged || !user) {
      navigate('/login'); // ✅ redirect safely
    } else {
      setIsUserLoggedIn(true);
    }
  }, [navigate]);

  const handleSearch = (data: any) => {
    setTripData(data);
    setCurrentStep("plan");
  };

  const startNewTrip = () => {
    setTripData(null);
    setCurrentStep("search");
  };

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    setIsUserLoggedIn(false);
    navigate("/login");
  };

  const features = [
    { icon: MapPin, title: "Destination Search", description: "Find and explore amazing destinations worldwide" },
    { icon: Calendar, title: "Smart Planning", description: "Create detailed day-by-day itineraries" },
    { icon: Compass, title: "Transportation", description: "Choose your preferred mode of travel" },
    { icon: Star, title: "Budget Tracking", description: "Keep track of your expenses and stay within budget" }
  ];

  // ✅ Fetch user activities
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.id) {
      axios
        .get(`http://localhost:1833/api/user-activities/${user.id}`)
        .then((res) => {
          if (res.data.success) {
            setUserActivities(res.data.activities);
          }
        })
        .catch((err) => {
          console.error("Failed to load activities:", err);
        })
        .finally(() => {
          setActivityLoading(false);
        });
    } else {
      setActivityLoading(false);
    }
  }, []);

  // ✅ Prevent crash if empty
  const groupedActivities = (userActivities || []).reduce((acc, act) => {
    const { destination, date } = act;
    if (!acc[destination]) acc[destination] = {};
    if (!acc[destination][date]) acc[destination][date] = [];
    acc[destination][date].push(act);
    return acc;
  }, {} as Record<string, Record<string, any[]>>);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ✅ Logout button only if logged in */}
      {isUserLoggedIn && (
        <div className="absolute top-4 right-4 z-20">
          <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      )}

      {currentStep === "search" ? (
        <>
          {/* Hero Section */}
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${heroImage})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background/60"></div>
            </div>
            <div className="relative z-10 container mx-auto px-4 text-center">
              <div className="animate-slide-in space-y-6 mb-12">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground">
                  Plan Your Perfect{" "}
                  <span className="block bg-gradient-hero bg-clip-text text-transparent">
                    Adventure
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                  Create unforgettable journeys with our intelligent travel planner. From destinations to detailed itineraries, we've got you covered.
                </p>
              </div>
              <div className="animate-fade-in">
                <TravelSearch onSearch={handleSearch} />
              </div>
            </div>
          </section>

          {/* Activities Section */}
          <section className="py-16 bg-background border-t border-muted">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-travel-blue mb-6 text-center">
                Your Planned Activities
              </h2>

              {activityLoading ? (
                <p className="text-center text-muted-foreground">Loading activities...</p>
              ) : userActivities.length === 0 ? (
                <p className="text-center text-muted-foreground">No activities found.</p>
              ) : (
                Object.entries(groupedActivities).map(([destination, dateGroups]) => (
                  <div key={destination} className="mb-10">
                    <h3 className="text-xl font-bold text-foreground mb-4">
                      Destination: {destination}
                    </h3>
                    {Object.entries(dateGroups).map(([date, acts]) => (
                      <Card key={date} className="mb-4 shadow-card-travel bg-muted/5">
                        <CardHeader>
                          <CardTitle className="text-travel-blue">
                            {formatDate(date)}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {acts.map((act) => (
                            <div
                              key={act.id}
                              className="p-4 border rounded-lg bg-gradient-card"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="text-lg font-semibold">{act.activity}</h4>
                                <span className="text-sm text-muted-foreground">
                                  ₹{act.estimated_cost}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">Time: {act.time}</p>
                              <p className="text-sm text-muted-foreground">Location: {act.location}</p>
                              <p className="text-sm text-muted-foreground">Notes: {act.notes || "N/A"}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-travel-blue mb-4">
                  Everything You Need to Plan
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Powerful tools to help you create the perfect travel experience
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <Card
                    key={feature.title}
                    className="text-center shadow-card-travel bg-gradient-card hover:shadow-travel transition-all duration-300 hover:scale-105"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-6">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-accent rounded-full flex items-center justify-center">
                        <feature.icon className="w-8 h-8 text-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold text-travel-blue mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-travel-blue">Trip Planner</h1>
            <Button variant="outline" onClick={startNewTrip}>
              Plan New Trip
            </Button>
          </div>
          <TripPlanner tripData={tripData} />
        </div>
      )}
    </div>
  );
};

export default Index;
