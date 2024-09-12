import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const App = () => {
  const position = [51.505, -0.09]; // London coordinates
  
  return (
    <div>
      <h1>Children's Hospitals Map</h1>
      <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position}>
          <Popup>
            A sample children's hospital. <br /> Add your hospital data here.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default App;
