const express = require("express");
const axios = require("axios");
const app = express();

// Use environment variables for sensitive information
const apiKey = process.env.OPENWEATHER_API_KEY || "b4b857a7d9d5a5c22c2c848613ab8a24";
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || "AIzaSyDsUA7j-lZ0J3sPtd_Lreq9v4cDnFWfMX0";
const newsApiKey = process.env.NEWS_API_KEY || "58e2cb2eebbf4003a5c0d968ca8175e5";

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index", { weather: null, location: null, newsData: null, error: null });
});

app.get("/weather", async (req, res) => {
  const city = req.query.city;

  const APIUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
  const geocodingAPIUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${googleMapsApiKey}`;
  const newsAPIUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(city)}&apiKey=${newsApiKey}`;

  let weather, location, newsData;
  let error = null;

  try {
    const [weatherResponse, mapResponse, newsResponse] = await Promise.all([
      axios.get(APIUrl),
      axios.get(geocodingAPIUrl),
      axios.get(newsAPIUrl),
    ]);

    // Handle invalid responses gracefully
    if (!weatherResponse.data || !mapResponse.data.results || !newsResponse.data) {
      throw new Error("Invalid response from one of the APIs");
    }

    weather = weatherResponse.data;
    location = mapResponse.data.results[0].geometry.location;
    newsData = newsResponse.data;
  } catch (err) {
    console.error(err);
    weather = null;
    location = null;
    newsData = null;
    error = "Error fetching data, please try again";
  }
 
  res.render("index", { weather, location, newsData, error });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
