export const TESTS = [
  { id:'t1', icon:'🩸', name:'Complete Blood Count (CBC)', params:'22 parameters', tags:['No fasting','Home collection'], price:299, mrp:499, disc:'40%', tat:'6 hrs', prep:'No fasting required' },
  { id:'t2', icon:'🦋', name:'Thyroid Panel (TSH, T3, T4)', params:'3 parameters', tags:['Fasting 8hrs','Home collection'], price:399, mrp:699, disc:'43%', tat:'6 hrs', prep:'Fast for 8 hours' },
  { id:'t3', icon:'🍬', name:'HbA1c + Fasting Sugar', params:'2 parameters', tags:['Fasting 12hrs','Home collection'], price:449, mrp:799, disc:'44%', tat:'8 hrs', prep:'Fast for 10-12 hours' },
  { id:'t4', icon:'❤️', name:'Lipid Profile', params:'8 parameters', tags:['Fasting 12hrs','Home collection'], price:349, mrp:599, disc:'42%', tat:'6 hrs', prep:'Fast for 12 hours' },
  { id:'t5', icon:'☀️', name:'Vitamin D3 (25-OH)', params:'1 parameter', tags:['No fasting','Home collection'], price:599, mrp:1100, disc:'45%', tat:'12 hrs', prep:'No fasting required' },
  { id:'t6', icon:'🫀', name:'Liver Function Test (LFT)', params:'12 parameters', tags:['Fasting 8hrs','Home collection'], price:499, mrp:899, disc:'44%', tat:'8 hrs', prep:'Fast for 8 hours' },
  { id:'t7', icon:'🧬', name:'Kidney Function Test (KFT)', params:'11 parameters', tags:['Fasting 8hrs','Home collection'], price:449, mrp:799, disc:'44%', tat:'6 hrs', prep:'Fast for 8 hours' },
  { id:'t8', icon:'💊', name:'Vitamin B12', params:'1 parameter', tags:['No fasting','Home collection'], price:499, mrp:850, disc:'41%', tat:'12 hrs', prep:'No fasting required' },
]

export const PACKAGES = [
  { id:'p1', icon:'🧪', bg:'pi-g', name:'Full Body Checkup', sub:'61 tests · Most popular', cat:'preventive', feat:true, includes:['CBC, Lipid, Liver, Kidney, Thyroid','HbA1c + Fasting Sugar','Vitamin D3 & B12','Chest X-Ray + Doctor Consult','Digital report on WhatsApp'], price:2499, mrp:4200, disc:'40%' },
  { id:'p2', icon:'❤️', bg:'pi-b', name:'Cardiac Screening', sub:'22 tests · Heart health', cat:'cardiac', includes:['Lipid Profile (extended)','ECG + 2D Echo','CRP, Homocysteine','Cardiac Enzymes (Troponin)'], price:3199, mrp:5400, disc:'41%' },
  { id:'p3', icon:'🌸', bg:'pi-p', name:"Women's Wellness", sub:'38 tests · For women 25+', cat:'women', includes:['Hormonal Panel (FSH, LH)','Pap Smear + Breast exam','Thyroid + Iron studies','Bone health (Calcium, Vit D)'], price:2799, mrp:4800, disc:'42%' },
  { id:'p4', icon:'🍬', bg:'pi-o', name:'Diabetes Care Panel', sub:'18 tests · Monitor diabetes', cat:'diabetes', includes:['HbA1c, FBS, PPBS','Insulin levels + C-Peptide','Kidney & Liver function','Retinopathy risk'], price:1899, mrp:3200, disc:'41%' },
  { id:'p5', icon:'👴', bg:'pi-t', name:'Senior Citizen Package', sub:'72 tests · For 60+', cat:'senior', includes:['Full Body + Cardiac + Diabetes','Bone density (BMD scan)','Cancer markers (PSA, CEA)','Doctor tele-consultation'], price:3999, mrp:6800, disc:'41%' },
  { id:'p6', icon:'💼', bg:'pi-r', name:'Pre-Employment Health', sub:'28 tests · With certificate', cat:'preventive', includes:['CBC, Blood Group, HIV, HBsAg','Chest X-Ray','Eye & hearing test','Fitness certificate'], price:1499, mrp:2600, disc:'42%' },
]

export const LABS = [
  { id:'l1', icon:'🏥', name:'HealthFirst Labs', loc:'Jubilee Hills', nabl:true, iso:true, rating:4.9, reviews:142, tat:'6 hrs' },
  { id:'l2', icon:'🔬', name:'Apollo Diagnostics', loc:'Banjara Hills', nabl:true, iso:true, rating:4.8, reviews:98, tat:'6 hrs' },
  { id:'l3', icon:'⚗️', name:'Vijaya Diagnostics', loc:'Ameerpet', nabl:true, iso:false, rating:4.7, reviews:87, tat:'8 hrs' },
  { id:'l4', icon:'🧪', name:'SRL Diagnostics', loc:'Kondapur', nabl:true, iso:true, rating:4.6, reviews:76, tat:'10 hrs' },
  { id:'l5', icon:'🏨', name:'Yashoda Imaging', loc:'Secunderabad', nabl:true, iso:false, rating:4.5, reviews:63, tat:'8 hrs' },
  { id:'l6', icon:'🩺', name:'Medicover', loc:'Madhapur', nabl:true, iso:true, rating:4.7, reviews:91, tat:'6 hrs' },
]

export const DOCTORS = [
  { id:'d1', av:'👩‍⚕️', bg:'linear-gradient(135deg,#f0fdf9,#dcfce7)', name:'Dr. Priya Rao', spec:'Internal Medicine · MBBS, MD', exp:'15 yrs exp', avail:true, rating:'4.9', consults:'2,400', fee:299 },
  { id:'d2', av:'👨‍⚕️', bg:'linear-gradient(135deg,#eff6ff,#dbeafe)', name:'Dr. Suresh Reddy', spec:'Cardiology · MBBS, DM', exp:'22 yrs exp', avail:false, availText:'Next: 2:00 PM', rating:'4.8', consults:'3,800', fee:499 },
  { id:'d3', av:'👩‍⚕️', bg:'linear-gradient(135deg,#fdf4ff,#f3e8ff)', name:'Dr. Kavitha Nair', spec:'Gynaecology · MBBS, MS', exp:'12 yrs exp', avail:true, rating:'4.9', consults:'1,900', fee:399 },
  { id:'d4', av:'👨‍⚕️', bg:'linear-gradient(135deg,#fff7ed,#fed7aa)', name:'Dr. Arjun Mehta', spec:'Endocrinology · MBBS, MD, DM', exp:'18 yrs exp', avail:false, availText:'Next: 4:00 PM', rating:'4.8', consults:'2,100', fee:599 },
]

export const FAQS = [
  { q:'How soon can I book home collection?', a:'Book by 9 AM for same-day. Next-day morning slots are always available. Home collection is free for orders above ₹999.' },
  { q:'How long does it take to get my report?', a:'Most routine tests within 6 hours of sample collection. Specialized tests may take 24–48 hours. Report arrives as a password-protected PDF on WhatsApp.' },
  { q:'Are all partner labs NABL certified?', a:"Yes — every partner lab on Checkupify is NABL accredited. We conduct quarterly audits and remove labs that don't maintain standards." },
  { q:'What is the refund policy?', a:'100% refund if booking not confirmed, phlebotomist doesn\'t arrive, or you cancel 2+ hours before appointment. No questions asked.' },
  { q:'Can I book for a family member?', a:'Yes. Add multiple family profiles and book for each member. Reports and confirmation go to the number provided for that patient.' },
  { q:'Is my health data secure?', a:'Encrypted at rest and in transit (256-bit SSL). DPDP Act compliant. Reports are password-protected. We never share data with third parties.' },
]

export const OFFERS = [
  { id:'o1', cls:'oc-navy', tag:'NEW USER', title:'₹200 OFF', desc:'On your first booking', code:'FIRST200' },
  { id:'o2', cls:'oc-green', tag:'HOME COLLECTION', title:'FREE', desc:'On orders above ₹999', code:'HOMEFREE' },
  { id:'o3', cls:'oc-orange', tag:'FULL BODY', title:'40% OFF', desc:'Full Body Checkup Package', code:'FULLBODY40' },
  { id:'o4', cls:'oc-purple', tag:'CORPORATE', title:'20% OFF', desc:'For company employees', code:'CORP20' },
  { id:'o5', cls:'oc-teal', tag:'WEEKEND', title:'15% OFF', desc:'Saturday & Sunday bookings', code:'WEEKEND15' },
]

export const TESTIMONIALS = [
  { name:'Anjali Sharma', loc:'Jubilee Hills, Hyd', rating:5, text:'Got my Full Body Checkup done in 45 minutes. Sample collected at 7 AM, report on WhatsApp by noon. Incredible service!', test:'Full Body Checkup' },
  { name:'Ravi Kumar', loc:'Kondapur, Hyd', rating:5, text:'Thyroid test done at home — painless, professional, and reports sent immediately. Definitely my go-to for all health tests.', test:'Thyroid Panel' },
  { name:'Meera Patel', loc:'Banjara Hills, Hyd', rating:5, text:'The phlebotomist was at my door in 30 mins. Very hygienic, used gloves, disposable needles. Reports are crystal clear.', test:"Women's Wellness" },
  { name:'Srinivas Rao', loc:'HITEC City, Hyd', rating:5, text:'Consulted Dr. Priya for diabetes management. Very thorough, explained everything. Video call quality was perfect.', test:'Video Consultation' },
]

export const CITIES = ['Hyderabad','Secunderabad','Warangal','Bengaluru','Delhi','Mumbai','Chennai','Pune']

export const QUICK_ACTIONS = [
  { icon:'🩸', name:'Book Test', desc:'1000+ tests available', primary:false, action:'tests' },
  { icon:'📦', name:'Health Packages', desc:'Bundled test combos', primary:false, action:'packages' },
  { icon:'👨‍⚕️', name:'Consult Doctor', desc:'Video consult in 15 min', primary:false, action:'doctors' },
  { icon:'🏠', name:'Home Collection', desc:'Phlebotomist at door', primary:false, action:'home' },
  { icon:'📊', name:'My Reports', desc:'View & download', primary:false, action:'reports' },
  { icon:'🚀', name:'Quick Rebook', desc:'Repeat last booking', primary:true, action:'rebook' },
]

export const SLOTS = ['7:00','7:30','8:00','8:30','9:00','9:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','16:00','17:00','18:00']
export const FULL_SLOTS = new Set(['8:00','9:30','14:00'])

export const PROMOS = { FIRST200: 200, HOMEFREE: 50, FULLBODY40: 0.4, CORP20: 0.2, WEEKEND15: 0.15, SAVE100: 100 }
