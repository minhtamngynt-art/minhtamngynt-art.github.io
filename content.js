const papers=[
  {
    "title": "Deep Learning for Detecting Diabetic Retinopathy",
    "venue": "<strong>IFSA-NAFIPS 2025</strong> · IFSA World Congress – NAFIPS Annual Meeting · Banff, Alberta, Canada · Aug 16–19, 2025 · Springer",
    "authors": "<strong>(Thanh) Minh Tam Nguyen</strong>, Nguyen Hoang Phuong",
    "status": "First author · Presented"
  },
  {
    "title": "Performance Evaluation and Explainability Assessment of Deep Learning Architectures for Age-Related Macular Degeneration Diagnosis in OCT Images",
    "venue": "<strong>AICI 2026</strong> · 7th Intl. Conference on AI and Computational Intelligence · Hanoi, Vietnam · Jan 4–5, 2026 · Springer",
    "authors": "<strong>(Thanh) Minh Tam Nguyen</strong>, Nguyen Hoang Phuong, Vladik Kreinovich, Tri Nguyen, Kelly Cohen",
    "status": "First author · Presented"
  },
  {
    "title": "Beyond Accuracy: Comparison of ResNet50 and GWN-Enhanced Models for Brain Tumor MRI Classification with LIME Visualization",
    "venue": "<strong>ICTIS 2026</strong> · 11th Intl. Conference on ICT for Intelligent Systems · Bangkok, Thailand · Apr 9–11, 2026 · Springer",
    "authors": "<strong>(Thanh) Minh Tam Nguyen</strong>, Mai Nhu Yen, Nguyen Quang Huy, Nguyen Thi Nhung, Nguyen Thi Huyen Chau, Nguyen Hoang Phuong, Dong Van He, Bui Xuan Cuong, Vladik Kreinovich",
    "status": "First author · Presented"
  },
  {
    "title": "Prototype-Based Explanations for Deep Neural Networks for the Classification of Brain Tumor Images",
    "venue": "<strong>ACRT</strong>",
    "authors": "Nguyen Quang Huy, Nguyen Thi Nhung, <strong>(Thanh) Minh Tam Nguyen</strong>, Nguyen Thi Huyen Chau, Nguyen Hoang Phuong, Dong Van He, Bui Xuan Cuong",
    "status": "Co-author · Revised manuscript submitted"
  },
  {
    "title": "Ensemble of Convolutional Neural Networks for Classification of Breast Cancer in X-Ray Images",
    "venue": "<strong>ESTAR</strong>",
    "authors": "Nguyen Hoang Phuong, Ha Manh Toan, <strong>(Thanh) Minh Tam Nguyen</strong> et al.",
    "status": "Co-author · Submitted"
  },
  {
    "title": "A Prototypical Interpretability Approach Using Earth Mover's Distance and Correlation for Medical Image Classification",
    "venue": "<strong>AICI 2026</strong>",
    "authors": "<strong>(Thanh) Minh Tam Nguyen</strong>, Nguyen Hoang Phuong, Vladik Kreinovich",
    "status": "First author · Submitted"
  }
];
const photos=[
  {
    "src": "assets/conf/banff.jpg",
    "alt": "Views of Banff, Canada"
  },
  {
    "src": "assets/conf/ifsa3.jpg",
    "alt": "After my research presentation"
  },
  {
    "src": "assets/conf/ifsa2.jpg",
    "alt": "With a professor from Seoul"
  },
  {
    "src": "assets/conf/ifsa2025.jpg",
    "alt": "IFSA–NAFIPS 2025 gala dinner"
  },
  {
    "src": "assets/conf/ifsa4.jpg",
    "alt": "An evening at the conference gala"
  },
  {
    "src": "assets/conf/cer.ictis.jpg",
    "alt": "ICTIS 2026"
  },
  {
    "src": "assets/conf/aici2026.jpg",
    "alt": "AICI 2026"
  },
  {
    "src": "assets/conf/aici2025.jpg",
    "alt": "AICI 2025"
  },
  {
    "src": "assets/conf/aici2025.2.jpg",
    "alt": "A lunch break at AICI 2025"
  },
  {
    "src": "assets/conf/digitrans.jpg",
    "alt": "DigiTrans 2025 at Thang Long University"
  },
  {
    "src": "assets/conf/seminar1.jpg",
    "alt": "A research seminar"
  },
  {
    "src": "assets/conf/seminar2.jpg",
    "alt": "Conversations at a research seminar"
  },
  {
    "src": "assets/conf/seminar3.jpg",
    "alt": "Sharing ideas at a research seminar"
  },
  {
    "src": "assets/conf/tlu.jpg",
    "alt": "At Thang Long University"
  },
  {
    "src": "assets/conf/nckh.jpg",
    "alt": "Scientific research"
  },
  {
    "src": "assets/conf/thesis.jpg",
    "alt": "Working on my thesis"
  }
];
const featured=["ifsa2025.jpg","aici2026.jpg","cer.ictis.jpg","digitrans.jpg"];
document.querySelector('#paper-grid').innerHTML=papers.map((p,i)=>'<article class="paper"><span class="meta">RESEARCH / 0'+(i+1)+'</span><h3>'+p.title+'</h3><p>'+p.venue+'</p><p class="authors">'+p.authors+'</p><p class="meta">'+p.status+'</p></article>').join('');
function card(p){return '<article class="photo-card"><button aria-label="View '+p.alt+'"><img src="'+p.src+'" alt="'+p.alt+'" loading="lazy"></button><p>'+p.alt+'</p></article>'};
document.querySelector('#gallery').innerHTML=featured.map(f=>photos.find(p=>p.src.endsWith('/'+f))).filter(Boolean).map(card).join('');
document.querySelector('#more-gallery').innerHTML=photos.filter(p=>!featured.some(f=>p.src.endsWith('/'+f))).map(card).join('');
