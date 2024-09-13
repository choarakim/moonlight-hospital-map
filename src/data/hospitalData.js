// src/data/hospitalData.js

export const hospitals = [
  { 
    name: "의료법인우리아이들의료재단우리아이들병원",
    position: [37.5014, 126.8867],
    address: "서울특별시 구로구 새말로 15, 2~10층,11층 일부호 (구로동, 삼전 솔하임)",
    phone: "02-858-0100",
    hours: {
      monday: { start: "18:00", end: "22:00" },
      tuesday: { start: "18:00", end: "22:00" },
      wednesday: { start: "18:00", end: "22:00" },
      thursday: { start: "18:00", end: "22:00" },
      friday: { start: "18:00", end: "22:00" },
      saturday: { start: "09:00", end: "16:00" },
      sunday: { start: "09:00", end: "16:00", note: "1, 2, 3, 4, 5 째주" },
      holiday: { start: "09:00", end: "16:00" }
    },
    website: "https://www.snuh.org/child/",
    진료과목: ["가정의학과", "구강내과", "내과", "비뇨의학과", "소아청소년과", "소아치과", "안과", "영상의학과", "이비인후과", "정신건강의학과", "피부과"],
    의료자원: []
  },
  { 
    name: "세브란스 어린이병원",
    position: [37.5622, 126.9410],
    address: "서울특별시 서대문구 연세로 50-1",
    phone: "02-2228-2114",
    hours: "24/7",
    website: "https://sev.iseverance.com/children/",
    진료과목: ["내과", "이비인후과"],
    의료자원: ["입원실"]
  },
  { 
    name: "삼성서울병원 어린이병원",
    position: [37.4881, 127.0856],
    address: "서울특별시 강남구 일원로 81",
    phone: "02-3410-3000",
    hours: "24/7",
    website: "http://www.samsunghospital.com/children/main/main.do",
    진료과목: ["내과", "피부과"],
    의료자원: ["X-RAY"]
  },
  { 
    name: "삼성서울병원 어린이병원4",
    position: [37.4881, 128.0856],
    address: "서울특별시 강남구 일원로 81",
    phone: "02-3410-3000",
    hours: "24/7",
    website: "http://www.samsunghospital.com/children/main/main.do",
    진료과목: ["내과", "피부과"],
    의료자원: ["X-RAY"]
  },
  // Add more hospitals here...
  // You can add as many hospitals as needed, following the same structure
];

// Note: If the number of hospitals becomes very large (e.g., several hundred or more),
// consider implementing performance optimizations such as:
// - Marker clustering
// - Lazy loading of data
// - More advanced filtering and search functionality