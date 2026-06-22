const express = require('express');
const axios = require('axios');
const db = require('../config/db');
require('dotenv').config();

const router = express.Router();

/**
 * Calculate distance between two coordinates using Haversine formula.
 * Returns distance in meters.
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * GET /api/nearby-restaurants
 * Query:
 *   lat, lon - coordinates
 *   pincode - optional pincode search
 *
 * Uses Google Places API (if key configured) for real restaurant photos,
 * falls back to Geoapify Places API otherwise.
 */
router.get('/nearby-restaurants', async (req, res) => {
  try {
    let { lat, lon, pincode } = req.query;
    const geoapifyKey = process.env.GEOAPIFY_API_KEY;
    const googleKey = process.env.GOOGLE_PLACES_API_KEY;

    // 1. If pincode is provided, geocode it first (using Geoapify)
    if (pincode) {
      if (!geoapifyKey) {
        return res.status(500).json({ error: 'Geoapify API key not configured for geocoding' });
      }
      try {
        const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(pincode)}&filter=countrycode:in&limit=1&apiKey=${geoapifyKey}`;
        const geocodeRes = await axios.get(geocodeUrl);
        if (geocodeRes.data.features && geocodeRes.data.features.length > 0) {
          const coords = geocodeRes.data.features[0].geometry.coordinates;
          lon = coords[0];
          lat = coords[1];
        } else {
          return res.status(404).json({ error: 'Pincode not found' });
        }
      } catch (err) {
        console.error('Geocoding error:', err.message);
        return res.status(502).json({ error: 'Failed to resolve pincode' });
      }
    }

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Missing coordinates or pincode' });
    }

    // Fetch internal restaurants from DB for matching
    const internalRestaurants = await new Promise((resolve, reject) => {
      db.all('SELECT id, name FROM restaurants', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    let nearby = [];

    // 2. Try Google Places Nearby Search (provides real photos)
    if (googleKey) {
      try {
        const googleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=5000&type=restaurant&key=${googleKey}`;
        const googleRes = await axios.get(googleUrl);

        if (googleRes.data.status === 'OK' && googleRes.data.results) {
          nearby = googleRes.data.results.slice(0, 20).map((place) => {
            const normalizedName = (place.name || '').toLowerCase().trim();
            const match = internalRestaurants.find(
              (r) => (r.name || '').toLowerCase().trim() === normalizedName
            );

            // Build real photo URL from Google Places Photos API
            let photoUrl = null;
            if (place.photos && place.photos.length > 0) {
              photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${place.photos[0].photo_reference}&key=${googleKey}`;
            }

            // Clean up Google's type tags for display
            const displayTypes = (place.types || [])
              .filter((t) => !['point_of_interest', 'establishment', 'food'].includes(t))
              .map((t) => t.replace(/_/g, ' '))
              .join(', ');

            return {
              id: place.place_id,
              db_id: match ? match.id : null,
              name: place.name || 'Unnamed Restaurant',
              distance: haversineDistance(
                parseFloat(lat),
                parseFloat(lon),
                place.geometry.location.lat,
                place.geometry.location.lng
              ),
              address: place.vicinity || '',
              categories: displayTypes || 'restaurant',
              photo: photoUrl,
              rating: place.rating || null,
              totalRatings: place.user_ratings_total || null,
            };
          });

          return res.json({ restaurants: nearby });
        }

        // If Google returned an error status, log it and fall through to Geoapify
        console.warn('Google Places API status:', googleRes.data.status, googleRes.data.error_message || '');
      } catch (err) {
        console.error('Google Places error, falling back to Geoapify:', err.message);
      }
    }

    // 3. Fallback: use Geoapify Places API (no real photos)
    if (!geoapifyKey) {
      return res.status(500).json({ error: 'No API key configured for restaurant search' });
    }

    const placesUrl = `https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:${lon},${lat},5000&bias=proximity:${lon},${lat}&limit=20&apiKey=${geoapifyKey.trim()}`;
    const placesRes = await axios.get(placesUrl);

    nearby = placesRes.data.features.map((feature) => {
      const props = feature.properties;
      const normalizedName = (props.name || '').toLowerCase().trim();
      const match = internalRestaurants.find(
        (r) => (r.name || '').toLowerCase().trim() === normalizedName
      );

      return {
        id: props.place_id,
        db_id: match ? match.id : null,
        name:
          props.name ||
          (props.address_line1 && props.address_line1 !== props.street
            ? props.address_line1
            : 'Unnamed Restaurant'),
        distance: Math.round(props.distance) || 0,
        address: props.formatted || '',
        categories: props.categories ? props.categories.join(', ') : 'Restaurant',
        photo: null, // Geoapify doesn't provide restaurant photos
        rating: null,
        totalRatings: null,
      };
    });

    return res.json({ restaurants: nearby });
  } catch (error) {
    console.error('Nearby feature error:', error.message);
    return res.status(502).json({
      error: 'Failed to fetch nearby restaurants',
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;