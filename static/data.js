// data.js
// Fixed data.js with correct image paths
class VacationDataManager {
    constructor() {
        this.data = {
            destinations: [
                {
                    id: 1,
                    name: "Bali, Indonesia",
                    location: "Bali, Indonesia", 
                    price: 300,
                    duration: "8 Days Tour",
                    image: "./images/destination-1.jpg", // Correct filename
                    amenities: ["2 Showers", "3 Beds", "Near Mountain"],
                    status: "active",
                    description: "Beautiful tropical paradise with stunning beaches and rich culture."
                },
                {
                    id: 2,
                    name: "Maldives Paradise",
                    location: "Maldives",
                    price: 450,
                    duration: "10 Days Tour", 
                    image: "./images/destination-2.jpg", // Correct filename
                    amenities: ["2 Showers", "3 Beds", "Near Beach"],
                    status: "active",
                    description: "Luxury overwater bungalows in crystal clear waters."
                },
                {
                    id: 3,
                    name: "Tokyo, Japan",
                    location: "Tokyo, Japan",
                    price: 500,
                    duration: "7 Days Tour",
                    image: "./images/destination-3.jpg", // Correct filename
                    amenities: ["2 Showers", "3 Beds", "City Center"],
                    status: "active",
                    description: "Modern metropolis blending tradition with cutting-edge technology."
                },
                {
                    id: 4,
                    name: "Swiss Alps",
                    location: "Switzerland",
                    price: 600,
                    duration: "8 Days Tour",
                    image: "./images/destination-4.jpg", // Correct filename
                    amenities: ["2 Showers", "3 Beds", "Mountain View"],
                    status: "active",
                    description: "Breathtaking alpine scenery and world-class skiing."
                },
                {
                    id: 5,
                    name: "Santorini, Greece",
                    location: "Santorini, Greece",
                    price: 550,
                    duration: "10 Days Tour",
                    image: "./images/destination-5.jpg", // Correct filename
                    amenities: ["2 Showers", "3 Beds", "Ocean View"],
                    status: "active",
                    description: "Iconic white-washed buildings with stunning sunsets."
                },
                {
                    id: 6,
                    name: "Dubai, UAE",
                    location: "Dubai, UAE",
                    price: 700,
                    duration: "7 Days Tour",
                    image: "./images/destination-6.jpg", // Correct filename
                    amenities: ["2 Showers", "3 Beds", "Luxury"],
                    status: "active",
                    description: "Modern marvels and opulent experiences in the desert."
                },
                {
                    id: 7,
                    name: "Iceland Adventure",
                    location: "Reykjavik, Iceland",
                    price: 650,
                    duration: "8 Days Tour",
                    image: "./images/destination-7.jpg", // Correct filename
                    amenities: ["2 Showers", "3 Beds", "Northern Lights"],
                    status: "active",
                    description: "Explore volcanoes, glaciers, and the magical aurora borealis."
                },
                {
                    id: 8,
                    name: "Paris, France",
                    location: "Paris, France",
                    price: 580,
                    duration: "10 Days Tour",
                    image: "./images/destination-8.jpg", // Correct filename
                    amenities: ["2 Showers", "3 Beds", "City Center"],
                    status: "active",
                    description: "The city of love, art, and exquisite cuisine."
                },
                {
                    id: 9,
                    name: "Machu Picchu, Peru",
                    location: "Cusco, Peru",
                    price: 480,
                    duration: "7 Days Tour",
                    image: "./images/destination-9.jpg", // Correct filename
                    amenities: ["2 Showers", "3 Beds", "Ancient Ruins"],
                    status: "active",
                    description: "Discover the lost city of the Incas in the Andes mountains."
                },
                {
                    id: 10,
                    name: "Safari Kenya",
                    location: "Nairobi, Kenya",
                    price: 750,
                    duration: "8 Days Tour",
                    image: "./images/destination-10.jpg", // Correct filename
                    amenities: ["2 Showers", "3 Beds", "Wildlife"],
                    status: "active",
                    description: "An unforgettable journey through the African savannah."
                },
                {
                    id: 11,
                    name: "New York City",
                    location: "New York, USA",
                    price: 600,
                    duration: "10 Days Tour",
                    image: "./images/destination-11.jpg", // Correct filename
                    amenities: ["2 Showers", "3 Beds", "Metropolitan"],
                    status: "active",
                    description: "The city that never sleeps, full of energy and landmarks."
                },
                {
                    id: 12,
                    name: "Aurora Norway",
                    location: "Tromsø, Norway",
                    price: 800,
                    duration: "7 Days Tour",
                    image: "./images/destination-12.jpg", // Correct filename
                    amenities: ["2 Showers", "3 Beds", "Aurora Views"],
                    status: "active",
                    description: "Witness the spectacular Northern Lights in the Arctic Circle."
                }
            ],
            categories: [
                {
                    id: 1,
                    name: "Singapore",
                    image: "./images/place-1.jpg", 
                    toursCount: 8,
                    status: "active"
                },
                {
                    id: 2,
                    name: "Canada",
                    image: "./images/place-2.jpg",
                    toursCount: 2, 
                    status: "active"
                },
                {
                    id: 3,
                    name: "Thailand", 
                    image: "./images/place-3.jpg",
                    toursCount: 5,
                    status: "active"
                },
                {
                    id: 4,
                    name: "Australia",
                    image: "./images/place-4.jpg",
                    toursCount: 5,
                    status: "active"
                }
            ]
        };
        this.listeners = {
            destinations: [],
            categories: []
        };
        this.loadFromStorage();
        this.setupCrossWindowSync();
    }

    get destinations() { return this.data.destinations; }
    get categories() { return this.data.categories; }

    loadFromStorage() {
        if (typeof(Storage) !== "undefined") {
            const stored = localStorage.getItem('vacationData');
            if (stored) {
                try {
                    this.data = JSON.parse(stored);
                    console.log("Data loaded from localStorage");
                } catch (e) {
                    console.error("Error parsing stored data", e);
                }
            }
        }
    }

    saveToStorage() {
        if (typeof(Storage) !== "undefined") {
            localStorage.setItem('vacationData', JSON.stringify(this.data));
            console.log("Data saved to localStorage");
            // Trigger cross-window sync
            window.dispatchEvent(new Event('storage'));
        }
    }

    setupCrossWindowSync() {
        window.addEventListener('storage', () => {
            console.log("Storage event detected, reloading data");
            this.loadFromStorage();
            this.notifyListeners('destinations', 'sync');
            this.notifyListeners('categories', 'sync');
        });
    }

    addListener(type, callback) {
        if (!this.listeners[type]) this.listeners[type] = [];
        this.listeners[type].push(callback);
    }

    removeListener(type, callback) {
        if (this.listeners[type]) {
            this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
        }
    }

    notifyListeners(type, action, data) {
        if (this.listeners[type]) {
            this.listeners[type].forEach(callback => callback(action, data));
        }
    }

    // Destination methods
    addDestination(destination) {
        const newId = Math.max(...this.data.destinations.map(d => d.id)) + 1;
        const newDestination = { ...destination, id: newId };
        this.data.destinations.push(newDestination);
        this.saveToStorage();
        this.notifyListeners('destinations', 'add', newDestination);
        return newDestination;
    }

    updateDestination(id, updates) {
        const index = this.data.destinations.findIndex(d => d.id === id);
        if (index !== -1) {
            this.data.destinations[index] = { ...this.data.destinations[index], ...updates };
            this.saveToStorage();
            this.notifyListeners('destinations', 'update', this.data.destinations[index]);
            return this.data.destinations[index];
        }
        return null;
    }

    deleteDestination(id) {
        const index = this.data.destinations.findIndex(d => d.id === id);
        if (index !== -1) {
            const deleted = this.data.destinations.splice(index, 1)[0];
            this.saveToStorage();
            this.notifyListeners('destinations', 'delete', deleted);
            return deleted;
        }
        return null;
    }

    // Category methods
    addCategory(category) {
        const newId = Math.max(...this.data.categories.map(c => c.id)) + 1;
        const newCategory = { ...category, id: newId };
        this.data.categories.push(newCategory);
        this.saveToStorage();
        this.notifyListeners('categories', 'add', newCategory);
        return newCategory;
    }

    updateCategory(id, updates) {
        const index = this.data.categories.findIndex(c => c.id === id);
        if (index !== -1) {
            this.data.categories[index] = { ...this.data.categories[index], ...updates };
            this.saveToStorage();
            this.notifyListeners('categories', 'update', this.data.categories[index]);
            return this.data.categories[index];
        }
        return null;
    }

    deleteCategory(id) {
        const index = this.data.categories.findIndex(c => c.id === id);
        if (index !== -1) {
            const deleted = this.data.categories.splice(index, 1)[0];
            this.saveToStorage();
            this.notifyListeners('categories', 'delete', deleted);
            return deleted;
        }
        return null;
    }

    // Utility methods
    getActiveDestinations() {
        return this.data.destinations.filter(d => d.status === 'active');
    }

    getActiveCategories() {
        return this.data.categories.filter(c => c.status === 'active');
    }
}

// Create global instance
const vacationDataManager = new VacationDataManager();

// Utility class for common functions
class VacationUtils {
    static generateAmenitiesHTML(amenities) {
        if (!amenities || !Array.isArray(amenities)) return '';
        return amenities.map(amenity => {
            let icon = 'fas fa-star';
            if (amenity.includes('Shower')) icon = 'fas fa-shower';
            else if (amenity.includes('Bed')) icon = 'fas fa-bed';
            else if (amenity.includes('Mountain')) icon = 'fas fa-mountain';
            else if (amenity.includes('Beach')) icon = 'fas fa-umbrella-beach';
            else if (amenity.includes('City')) icon = 'fas fa-city';
            else if (amenity.includes('Luxury')) icon = 'fas fa-building';
            else if (amenity.includes('Northern Lights')) icon = 'fas fa-snowflake';
            else if (amenity.includes('Ocean View')) icon = 'fas fa-water';
            else if (amenity.includes('Ancient Ruins')) icon = 'fas fa-landmark';
            else if (amenity.includes('Wildlife')) icon = 'fas fa-paw';
            else if (amenity.includes('Metropolitan')) icon = 'fas fa-city';
            else if (amenity.includes('Aurora Views')) icon = 'fas fa-star';

            return `<li><i class="${icon}"></i> ${amenity}</li>`;
        }).join('');
    }

    static formatPrice(price) {
        return `$${price}/person`;
    }
}