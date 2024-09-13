// src/components/HospitalHours.js

import React from 'react';

const HospitalHours = ({ hours }) => {
  const daysInKorean = {
    monday: "월요일",
    tuesday: "화요일",
    wednesday: "수요일",
    thursday: "목요일",
    friday: "금요일",
    saturday: "토요일",
    sunday: "일요일",
    holiday: "공휴일"
  };

  const hourStyle = {
    margin: '0',
    padding: '2px 0',
    fontSize: '0.9em',
    lineHeight: '1.2'
  };

  return (
    <div>
      <h4 style={{ marginBottom: '5px' }}>운영 시간:</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 10px' }}>
        {Object.entries(hours).map(([day, timeInfo]) => (
          <p key={day} style={hourStyle}>
            <strong>{daysInKorean[day]}:</strong> {timeInfo.start} - {timeInfo.end}
            {timeInfo.note && <span style={{ display: 'block', fontSize: '0.8em', color: '#666' }}>({timeInfo.note})</span>}
          </p>
        ))}
      </div>
    </div>
  );
};

export default HospitalHours;