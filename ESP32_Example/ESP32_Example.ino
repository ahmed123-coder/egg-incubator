/*
 * Fa9asa - ESP32 Sensor Data Sender
 * 
 * Sends temperature, humidity, heater status, and fan status
 * to the Fa9asa web API via HTTP POST.
 *
 * The incubator continues working offline even if the POST fails.
 * This is purely a monitoring overlay.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ---- CONFIGURATION ----
const char* WIFI_SSID = "YourWiFiSSID";
const char* WIFI_PASS = "YourWiFiPassword";

// Your Vercel deployment URL
const char* API_URL = "https://your-app.vercel.app/api/sensor";

// ---- SENSOR SIMULATION (replace with your actual sensor readings) ----
float readTemperature() {
  // Replace with DHT22 / DS18B20 / BME280 reading
  return 37.5;
}

float readHumidity() {
  // Replace with DHT22 / BME280 reading
  return 55.0;
}

bool getHeaterStatus() {
  // Read your heater relay pin
  return true;
}

bool getFanStatus() {
  // Read your fan relay pin
  return false;
}

// ---- SEND DATA ----
void sendSensorData(float temp, float hum, bool heater, bool fan) {
  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["temperature"] = temp;
  doc["humidity"] = hum;
  doc["heaterOn"] = heater;
  doc["fanOn"] = fan;

  String payload;
  serializeJson(doc, payload);

  int httpCode = http.POST(payload);

  if (httpCode > 0) {
    Serial.printf("HTTP POST success: %d\n", httpCode);
  } else {
    Serial.printf("HTTP POST failed: %s\n", http.errorToString(httpCode).c_str());
    // Incubator continues working — this is non-critical
  }

  http.end();
}

// ---- SETUP ----
void setup() {
  Serial.begin(115200);

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
}

// ---- MAIN LOOP ----
void loop() {
  float temp = readTemperature();
  float hum = readHumidity();
  bool heater = getHeaterStatus();
  bool fan = getFanStatus();

  sendSensorData(temp, hum, heater, fan);

  // Send every 10 seconds (adjust as needed)
  delay(10000);
}
