# ✈️ Wanderlust | Professional Travel Planning Dashboard

**Wanderlust** is a sophisticated **Single Page Application (SPA)** designed to provide travelers with a comprehensive suite of tools for trip planning. The platform integrates multiple third-party APIs to deliver real-time data on weather, global events, public holidays, and financial tools within a seamless, interactive user interface.

---

## 🌐 Live Demo
**Check out the live project here:** [https://saif-elmansi.github.io/Wanderlust/](https://saif-elmansi.github.io/Wanderlust/)

---

## 🚀 Core Functionalities

* **Global Destination Explorer**: Users can search and select from over 90 countries to instantly retrieve localized travel data.
* **Integrated Travel Calendar**: Displays national public holidays and discovers "Long Weekend" opportunities for optimized vacation planning.
* **Real-time Event Discovery**: Powered by Ticketmaster API to provide live data on concerts, sports, and cultural events in selected cities.
* **Dynamic Weather Suite**: Provides current conditions, hourly forecasts, and a 7-day outlook using precise coordinates.
* **Financial & Solar Tools**: Includes a live currency converter with real-time exchange rates and accurate sunrise/sunset tracking.
* **Personalized Itinerary (My Plans)**: A persistence-based system allowing users to save preferred holidays and events to a dedicated dashboard using `localStorage`.

---

## 🛠 Technical Stack

* **Frontend**: Vanilla JavaScript (ES6+ Modules), HTML5, CSS3.
* **API Integrations**:
    * **Nager.Date**: Public holidays and calendar logic.
    * **Rest Countries**: Demographic data and internationalization.
    * **Open-Meteo**: Meteorological forecasting.
    * **Ticketmaster**: Event and ticketing data.
    * **Sunrise-Sunset**: Astronomical time calculations.
    * **ExchangeRate-API**: Real-time currency conversion rates.
* **UI/UX Enhancements**: 
    * **SweetAlert2**: Professional toast notifications and interactive modals.
    * **FontAwesome**: High-quality vector icons.

---

## 🏗 Architectural Highlights

* **SPA Navigation**: Custom routing logic that manages views and updates the browser URL without page refreshes.
* **Asynchronous Data Handling**: Utilizes `Promise.all` for parallel API fetching to ensure minimum loading times and maximum performance.
* **State Management**: Implements an interactive "Saved" state for UI elements (e.g., heart icons) that persists across sessions.
* **Loading Lifecycle**: A centralized `toggleLoading` system to manage user feedback during data-heavy operations.

---

## 📁 Project Structure

```text
├── src/
│   ├── css/           # Modularized stylesheets (Layout, Components, Views, etc.)
│   └── js/            # Core business logic and API controllers
├── index.html         # Main entry point
└── README.md          # Project documentation