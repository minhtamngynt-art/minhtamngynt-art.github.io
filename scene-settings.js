/* FILE TỰ CHỈNH — lưu rồi Ctrl+F5 để xem.
   x/y: tỉ lệ màn hình (0.5 = giữa). size: pixel. glow: cường độ sáng.
   Home/Fall/Vinyl giữ điểm neo riêng; Notes neo trực tiếp trên lá thư.
   Quỹ đạo chỉ tác động huy hiệu, không đổi chữ hoặc bố cục. */
window.SceneSettings = {
  wheelDuration: 1000, // mili giây/chuyển cảnh bằng chuột; điện thoại vẫn cuộn tự nhiên
  wheelFallDuration: 700, // Fall vẫn là cảnh chuyển ngắn
  glow: 1.05, // cùng độ sáng nền cho toàn bộ hành trình
  flowerMotion: {
    3: {enter:.76,exit:1.48,turn:-6}, // About: tiến gần, tỏa ra rồi tan
    4: {enter:1.35,exit:.72,turn:5},  // Papers: lùi xa và thu nhỏ
    5: {enter:.72,exit:1.55,turn:-4}, // World: mở rộng như khung cảnh đến gần
    6: {enter:1.3,exit:1.22,turn:3},  // Notes: nhẹ nhàng đáp xuống, tan khi đọc hết
  },
  flowers: {
    about: 'about-laurel',    // mộc lan lớn, lá xanh và viền vàng
    papers: 'papers-laurel',  // nguyệt quế vàng mảnh
    world: 'world-ginkgo',    // bạch quả hình quạt, chồi hoa ngà
    notes: 'notes-flowers',   // hoa khô nhỏ và lá xanh đậm
  },
  stops: {
    3: { desktop: {x:.85,y:.27,size:115}, mobile: {x:.84,y:.20,size:76}, rx:-12,ry:22,rz:-15 },
    4: { desktop: {x:.80,y:.19,size:102}, mobile: {x:.84,y:.20,size:65}, rx:8,ry:-16,rz:12 },
    5: { desktop: {x:.86,y:.26,size:112}, mobile: {x:.83,y:.20,size:73}, rx:-8,ry:18,rz:-12 },
  },
  // Hai điểm điều khiển Bézier (x/y = tỉ lệ màn hình), không phải điểm dừng.
  // 2 = Vinyl→About, 3 = About→Papers, 4 = Papers→World, 5 = World→Notes.
  arcs: {
    2: { c1:{x:.58,y:.09},c2:{x:.96,y:.08},size:178,rx:-17,ry:42,rz:30,glow:.7 }, // vút lên bên phải
    3: { c1:{x:.35,y:.10},c2:{x:.30,y:.10},size:158,rx:14,ry:-34,rz:-65,glow:.75 }, // 4→5: vòng trái trên cao, luôn ở phần trên màn hình
    4: { c1:{x:.96,y:.80},c2:{x:.30,y:.86},size:172,rx:-20,ry:38,rz:70,glow:.75 }, // 5→6: lượn xuống thấp rồi vòng lên điểm đáp
    5: { c1:{x:.48,y:.02},c2:{x:.24,y:.20},size:148,rx:10,ry:-22,rz:-28,glow:.7 }, // vòng cung trên rồi đáp vào thư
  },
};
