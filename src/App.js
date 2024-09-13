import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './leaflet_custom.css'; 
import HospitalHours from './components/HospitalHours';
import hospitalData from './data/hospitalData.json';
import './App.css';

// Fix for default marker image
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const ShareButton = ({ hospital }) => {
  const [shared, setShared] = useState(false);

  const shareInfo = async () => {
    const info = `
병원 이름: ${hospital.name}
주소: ${hospital.address}
전화: ${hospital.phone}
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: hospital.name,
          text: info,
          url: hospital.website,
        });
        setShared(true);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(info).then(() => {
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      });
    }
  };

  return (
    <button onClick={shareInfo} className="share-button">
      {shared ? '공유됨!' : '정보 공유하기'}
    </button>
  );
};

const HospitalInfo = ({ hospital }) => (
  <div className="hospital-info">
    <h2>{hospital.name}</h2>
    <p className="hospital-info-details">지역: {hospital.region} | 유형: {hospital.type}</p>
    <p className="hospital-info-details">주소: {hospital.address}</p>
    <p className="hospital-info-details">전화: <a href={`tel:${hospital.phone}`}>{hospital.phone}</a></p>
    <div className="hospital-hours">
      <HospitalHours hours={hospital.hours} />
    </div>
    <p>진료과목: {hospital.진료과목.join(', ')}</p>
    {hospital.의료자원.length > 0 && <p>의료자원: {hospital.의료자원.join(', ')}</p>}
    <p><a href={hospital.website} target="_blank" rel="noopener noreferrer">병원 웹사이트 방문</a></p>
    <ShareButton hospital={hospital} />
  </div>
);

const RegionSection = ({ region, hospitals }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{ marginBottom: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#f0f0f0',
          border: 'none',
          textAlign: 'left',
          fontSize: '1.1em',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        {region} ({hospitals.length}) {isExpanded ? '▲' : '▼'}
      </button>
      {isExpanded && (
        <div style={{ padding: '10px' }}>
          {hospitals.map((hospital, index) => (
            <div key={index} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: index < hospitals.length - 1 ? '1px solid #eee' : 'none' }}>
              <HospitalInfo hospital={hospital} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ListView = ({ hospitals }) => {
  const groupedHospitals = hospitals.reduce((acc, hospital) => {
    if (!acc[hospital.region]) {
      acc[hospital.region] = [];
    }
    acc[hospital.region].push(hospital);
    return acc;
  }, {});

  return (
    <div style={{ height: '600px', overflowY: 'auto', padding: '10px' }}>
      {Object.entries(groupedHospitals)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([region, regionHospitals]) => (
          <RegionSection key={region} region={region} hospitals={regionHospitals} />
        ))}
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

const MapView = ({ hospitals, userLocation }) => {
  const koreaCenter = [36.5, 127.5];
  const defaultZoom = 7;

  return (
    <MapContainer center={userLocation || koreaCenter} zoom={userLocation ? 13 : defaultZoom} style={{ height: '900px', width: '100%' }}>
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
    </MapContainer>
  );
};

const Footer = () => {
  const footerStyle = {
    padding: '10px',
    textAlign: 'center',
    fontSize: '0.8em',
    marginTop: '20px',
  };

  const lineStyle = {
    margin: '3px 0',
  };

  const linkStyle = {
    color: 'inherit',
    textDecoration: 'underline',
  };

  return (
    <footer style={footerStyle}>
      <p style={lineStyle}>
        by <a href="https://blog.naver.com/namixkim1/223575493118" style={linkStyle} target="_blank" rel="noopener noreferrer">김초아라</a> @ 
        <a href="https://blog.naver.com/namixkim1/223575850518" style={linkStyle} target="_blank" rel="noopener noreferrer"> 하늘치데이터연구소</a>
      </p>
      <p style={lineStyle}>Special thanks to 지누</p>
      <p style={lineStyle}>수정요청, 문의 choarakim<span style={{fontSize: '0.9em'}}>(골뱅이)</span>gmail<span style={{fontSize: '0.9em'}}>(쩜)</span>com</p>
    </footer>
  );
};

const App = () => {
  const [hospitals, setHospitals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [진료과목Filters, set진료과목Filters] = useState({});
  const [의료자원Filters, set의료자원Filters] = useState({});
  const [isMapView, setIsMapView] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationMessage, setLocationMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    setHospitals(hospitalData.hospitals);

    const 진료과목Set = new Set();
    const 의료자원Set = new Set();
    hospitalData.hospitals.forEach(hospital => {
      hospital.진료과목.forEach(item => 진료과목Set.add(item));
      hospital.의료자원.forEach(item => 의료자원Set.add(item));
    });
    set진료과목Filters(Object.fromEntries([...진료과목Set].map(item => [item, false])));
    set의료자원Filters(Object.fromEntries([...의료자원Set].map(item => [item, false])));
    
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
    Object.entries(진료과목Filters).every(([key, value]) => !value || hospital.진료과목.includes(key)) &&
    Object.entries(의료자원Filters).every(([key, value]) => !value || hospital.의료자원.includes(key))
  );

  const handleCheckboxChange = (category, item) => {
    if (category === '진료과목') {
      set진료과목Filters(prev => ({ ...prev, [item]: !prev[item] }));
    } else if (category === '의료자원') {
      set의료자원Filters(prev => ({ ...prev, [item]: !prev[item] }));
    }
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

      <div style={{ marginBottom: '10px' }}>
        <button 
          className="detailed-search-button"
          onClick={() => setIsSearchExpanded(!isSearchExpanded)}
        >
          상세 검색 {isSearchExpanded ? '▲' : '▼'}
        </button>
        
        {isSearchExpanded && (
          <div style={{ padding: '10px', border: '1px solid #ccc' }}>
            <input
              type="text"
              placeholder="병원 이름으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
            
            <div style={{ marginBottom: '10px' }}>
              <h3>진료과목</h3>
              {Object.keys(진료과목Filters).map(item => (
                <label key={item} style={{ marginRight: '10px', display: 'inline-block' }}>
                  <input
                    type="checkbox"
                    checked={진료과목Filters[item]}
                    onChange={() => handleCheckboxChange('진료과목', item)}
                  />
                  {item}
                </label>
              ))}
            </div>

            <div style={{ marginBottom: '10px' }}>
              <h3>의료자원</h3>
              {Object.keys(의료자원Filters).map(item => (
                <label key={item} style={{ marginRight: '10px', display: 'inline-block' }}>
                  <input
                    type="checkbox"
                    checked={의료자원Filters[item]}
                    onChange={() => handleCheckboxChange('의료자원', item)}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <button 
        className="view-toggle-button"
        onClick={() => setIsMapView(!isMapView)}
      >
        {isMapView ? '목록 보기' : '지도 보기'}
      </button>

      {isMapView ? (
        <MapView hospitals={filteredHospitals} userLocation={userLocation} />
      ) : (
        <ListView hospitals={filteredHospitals} />
      )}

      <Footer />
    </div>
  );
};

export default App;