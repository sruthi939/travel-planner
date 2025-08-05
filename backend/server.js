require('dotenv').config();
const express = require('express');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcryptjs');

const app = express();

// Allow only frontend URL to call backend
app.use(cors({
    origin: '*',
    credentials: true,
}));
app.use(express.json());

// Initialize DB
const db = knex({
    client: 'mysql',
    connection: {
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: '',
        database: 'travel_planner',
    },
});

// =================== AUTH ROUTES ===================

// REGISTER
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    try {
        const existingUser = await db('user_creds').where({ email }).first();
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [newUserId] = await db('user_creds').insert({
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: newUserId,
                name,
                email,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error occurred during registration', error: error.message });
    }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    try {
        const user = await db('user_creds').where({ email }).first();

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name || null,
            },
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error occurred during login', error: error.message });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    // Check if user exists
    const user = await knex('users').where({ email }).first();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await knex('users')
      .where({ email })
      .update({ password: hashedPassword });

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// =================== TRIP ROUTES ===================

// CREATE trip
app.post('/api/trips', async (req, res) => {
    const { user_id, destination, startDate, endDate, budget, transport } = req.body;
    try {
        const [tripId] = await db('trips').insert({
            user_id,
            destination,
            start_date: startDate,
            end_date: endDate,
            budget,
            transport: JSON.stringify(transport),
        });
        res.status(201).json({ success: true, tripId });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to create trip", error: err.message });
    }
});

// READ trips for a user
app.get('/api/trips/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
        const trips = await db('trips').where({ user_id });
        res.status(200).json({ success: true, trips });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch trips", error: err.message });
    }
});

// DELETE a trip and its activities
app.delete('/api/trips/:trip_id', async (req, res) => {
    const { trip_id } = req.params;
    try {
        await db('activities').where({ trip_id }).del(); // optional if using ON DELETE CASCADE
        await db('trips').where({ id: trip_id }).del();
        res.status(200).json({ success: true, message: "Trip deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to delete trip", error: err.message });
    }
});

// =================== ACTIVITY ROUTES ===================
// Get all activities by user ID
app.get('/api/user-activities/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const activities = await db('activities')
      .join('trips', 'activities.trip_id', 'trips.id')
      .where('trips.user_id', user_id)
      .select(
        'activities.id',
        'activities.activity',
        'activities.date',
        'activities.time',
        'activities.location',
        'activities.notes',
        'activities.estimated_cost',
        'trips.destination'
      );

    if (activities.length === 0) {
      return res.status(200).json({ success: true, activities: [] });
    }

    res.status(200).json({ success: true, activities });
  } catch (err) {
    console.error('Error fetching user activities:', err.message);
    res.status(500).json({ success: false, message: "Failed to fetch activities", error: err.message });
  }
});
// ADD activity
app.post('/api/activities', async (req, res) => {
    const { trip_id, date, time, activity, location, notes, estimated_cost } = req.body;
    try {
        const [id] = await db('activities').insert({
            trip_id,
            date,
            time,
            activity,
            location,
            notes,
            estimated_cost,
        });
        res.status(201).json({ success: true, activityId: id });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to add activity", error: err.message });
    }
});

// READ activities for a trip
app.get('/api/activities/:trip_id', async (req, res) => {
    const { trip_id } = req.params;
    try {
        const activities = await db('activities').where({ trip_id });
        res.status(200).json({ success: true, activities });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to get activities", error: err.message });
    }
});

// DELETE activity
app.delete('/api/activities/:activity_id', async (req, res) => {
    const { activity_id } = req.params;
    try {
        await db('activities').where({ id: activity_id }).del();
        res.status(200).json({ success: true, message: "Activity deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to delete activity", error: err.message });
    }
});

// UPDATE activity
app.put('/api/activities/:activity_id', async (req, res) => {
    const { activity_id } = req.params;
    const { date, time, activity, location, notes, estimated_cost } = req.body;
    try {
        await db('activities').where({ id: activity_id }).update({
            date,
            time,
            activity,
            location,
            notes,
            estimated_cost,
        });
        res.status(200).json({ success: true, message: "Activity updated" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update activity", error: err.message });
    }
});

// =================== SERVER START ===================
const PORT = process.env.PORT || 1833;
app.listen(PORT, () => {
    console.log(`🚀 Server Running on http://localhost:${PORT}`);
});
