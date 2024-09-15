import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './leaflet_custom.css'; 
import hospitalData from './data/hospitalData.json';
import './App.css';

// Fix for default marker image (unchanged)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Extracted components
const ShareButton = ({ hospital }) => {
  const [shared, setShared] = useState(false);

  const shareInfo = async () => {
    const info = `
병원 이름: ${hospital.name}
주소: ${hospital.address}
전화: ${hospital.phone}
    `.trim();

    try {
      if (navigator.share) {
        await navigator.share({ title: hospital.name, text: info });
      } else {
        await navigator.clipboard.writeText(info);
      }
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <button onClick={shareInfo} className="share-button">
      {shared ? '복사됨!' : '정보 공유하기'}
    </button>
  );
};
const ListView = ({ hospitals }) => {
  const groupedHospitals = hospitals.reduce((acc, hospital) => {
    (acc[hospital.region] = acc[hospital.region] || []).push(hospital);
    return acc;
  }, {});

  return (
    <div className="list-view">
      {Object.entries(groupedHospitals)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([region, regionHospitals]) => (
          <RegionSection key={region} region={region} hospitals={regionHospitals} />
        ))}
    </div>
  );
};

const RegionSection = ({ region, hospitals }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="region-section">
      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="region-toggle"
      >
        {region} ({hospitals.length}) {isExpanded ? '▲' : '▼'}
      </button>
      {isExpanded && (
        <div className="region-hospitals">
          {hospitals.map((hospital, index) => (
            <div key={index} className="hospital-item">
              <HospitalInfo hospital={hospital} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const HospitalInfo = ({ hospital }) => (
  <div className="hospital-info">
    <h2>{hospital.name}</h2>
    <p className="hospital-info-main">
      {hospital.type} | <a href={`tel:${hospital.phone}`}>{hospital.phone}</a>
    </p>
    <p className="hospital-info-main">{hospital.address}</p>
    <div className="hospital-hours">
      <HospitalHours hours={hospital.hours} />
    </div>
    <p className="hospital-info-details">
      진료과목: {hospital.specialties.join(', ')}
    </p>
    {hospital.resources && hospital.resources.length > 0 && (
      <p className="hospital-info-details">
        의료자원: {hospital.resources.join(', ')}
      </p>
    )}
    <ShareButton hospital={hospital} />
  </div>
);

const HospitalHours = ({ hours }) => {
  const daysAbbreviation = {
    monday: "월",
    tuesday: "화",
    wednesday: "수",
    thursday: "목",
    friday: "금",
    saturday: "토",
    sunday: "일",
    holiday: "공휴일"
  };

  return (
    <div className="hospital-hours">
      <h4>운영 시간:</h4>
      <div className="hospital-hours-grid">
        {Object.entries(hours).map(([day, timeInfo]) => (
          <div key={day} className="hospital-hours-item">
            <span className="hospital-hours-day">{daysAbbreviation[day]}</span>
            <span className="hospital-hours-time">
              {timeInfo.start}-{timeInfo.end}
              {timeInfo.note && (
                <span className="hospital-hours-note">
                  ({timeInfo.note})
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const LocationMarker = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 13);
    }
  }, [map, position]);

  return position ? (
    <Marker position={position}>
      <Popup>현재 위치</Popup>
    </Marker>
  ) : null;
};

const CurrentLocationButton = ({ userLocation }) => {
  const map = useMap();

  const handleClick = () => {
    if (userLocation) {
      map.flyTo(userLocation, 13);
    } else {
      alert('현재 위치 정보를 사용할 수 없습니다.');
    }
  };

  return (
    <button onClick={handleClick} className="current-location-button">
      현재 위치로
    </button>
  );
};

const MapView = ({ hospitals, userLocation }) => {
  const koreaCenter = [36.5, 127.5];
  const defaultZoom = 7;

  return (
    <div className="map-container">
      <MapContainer 
        center={userLocation || koreaCenter} 
        zoom={userLocation ? 13 : defaultZoom} 
        className="leaflet-container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {hospitals.map((hospital, index) => (
          <Marker key={index} position={hospital.position}>
            <Popup>
              <HospitalInfo hospital={hospital} />
            </Popup>
          </Marker>
        ))}
        <LocationMarker position={userLocation} />
        <CurrentLocationButton userLocation={userLocation} />
      </MapContainer>
    </div>
  );
};

const Footer = () => (
  <footer className="footer">
    <p>
      by <a href="https://blog.naver.com/namixkim1/223575493118" target="_blank" rel="noopener noreferrer">김초아라</a> @ 
      <a href="https://blog.naver.com/namixkim1/223575850518" target="_blank" rel="noopener noreferrer"> 하늘치데이터연구소</a>
    </p>
    <p>Special thanks to 지누</p>
    <p>수정요청, 문의 choarakim<span className="email-obfuscation">(골뱅이)</span>gmail<span className="email-obfuscation">(쩜)</span>com</p>
  </footer>
);

const GoToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    toggleVisibility(); // Check initial scroll position

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="go-to-top-button">
      ↑ 맨 위로
    </button>
  );
};

const App = () => {
  const [hospitals, setHospitals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilters, setSpecialtyFilters] = useState({});
  const [resourceFilters, setResourceFilters] = useState({});
  const [isMapView, setIsMapView] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationMessage, setLocationMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    setHospitals(hospitalData);

    const specialtySet = new Set();
    const resourceSet = new Set();
    hospitalData.forEach(hospital => {
      hospital.specialties.forEach(item => specialtySet.add(item));
      hospital.resources?.forEach(item => resourceSet.add(item));
    });
    setSpecialtyFilters(Object.fromEntries([...specialtySet].map(item => [item, false])));
    setResourceFilters(Object.fromEntries([...resourceSet].map(item => [item, false])));
    
    setLoading(false);

    if ("geolocation" in navigator) {
      setLocationMessage("위치 정보를 요청 중입니다. 근처의 병원을 보여드리기 위해 사용됩니다.");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setLocationMessage("위치 정보를 성공적으로 받았습니다.");
        },
        (error) => {
          console.error("Error getting user location:", error);
          setLocationMessage("위치 정보를 받지 못했습니다. 전체 지도를 표시합니다.");
        }
      );
    } else {
      setLocationMessage("이 브라우저에서는 위치 정보를 사용할 수 없습니다.");
    }
  }, []);

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    Object.entries(specialtyFilters).every(([key, value]) => !value || hospital.specialties.includes(key)) &&
    Object.entries(resourceFilters).every(([key, value]) => !value || (hospital.resources && hospital.resources.includes(key)))
  );

  const handleCheckboxChange = (category, item) => {
    const setFunction = category === '진료과목' ? setSpecialtyFilters : setResourceFilters;
    setFunction(prev => ({ ...prev, [item]: !prev[item] }));
  };

  if (loading) {
    return <div>데이터를 불러오는 중입니다...</div>;
  }

  return (
    <div className="app-content">
      <h1 className="app-title">
        <span className="emoji">🌙</span>
        달빛 어린이 병원 지도
      </h1>
      {locationMessage && <p>{locationMessage}</p>}
      <p className="info-message red-small-font">
        진료시간이 불규칙할 수 있으니 반드시 전화(119 또는 병원)로 진료시간 확인 후 방문해주시기 바랍니다!
      </p>

      <button 
        className="detailed-search-button"
        onClick={() => setIsSearchExpanded(!isSearchExpanded)}
      >
        상세 검색 {isSearchExpanded ? '▲' : '▼'}
      </button>
      
      {isSearchExpanded && (
        <div className="search-expanded">
          <input
            type="text"
            placeholder="병원 이름으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          {['진료과목', '의료자원'].map(category => (
            <div key={category} className="filter-section">
              <h3>{category}</h3>
              {Object.keys(category === '진료과목' ? specialtyFilters : resourceFilters).map(item => (
                <label key={item} className="filter-label">
                  <input
                    type="checkbox"
                    checked={category === '진료과목' ? specialtyFilters[item] : resourceFilters[item]}
                    onChange={() => handleCheckboxChange(category, item)}
                  />
                  {item}
                </label>
              ))}
            </div>
          ))}
        </div>
      )}
      
      <button 
        className="view-toggle-button"
        onClick={() => setIsMapView(!isMapView)}
      >
        {isMapView ? '목록으로 보기' : '지도로 보기'}
      </button>

      {isMapView ? (
        <MapView hospitals={filteredHospitals} userLocation={userLocation} />
      ) : (
        <ListView hospitals={filteredHospitals} />
      )}

      <Footer />
      <GoToTopButton />
    </div>
  );
};

export default App;