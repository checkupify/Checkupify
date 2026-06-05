export interface Booking {
  id: string; user_id: string|null; lab_id: string|null; package_id: string|null;
  patient_name: string; patient_age: number; patient_gender: string; patient_phone: string;
  appointment_date: string; slot_time: string; collection_type: string; address: string|null;
  amount: number; discount: number; status: string; stage: string; sla_status: string;
  is_corporate: boolean; rejection_reason: string|null; report_url: string|null;
  notes: string|null; confirmed_at: string|null; created_at: string; updated_at: string;
  lab?: { name: string; city: string; phone: string|null } | null;
  package?: { name: string; base_price: number } | null;
}
export interface Lab {
  id: string; name: string; city: string; address: string|null; nabl_certified: boolean;
  rating: number; avg_tat_hours: number; score: number; phone: string|null; email: string|null;
  active: boolean; network_type: string; home_collection: boolean; home_collection_charge: number;
}
export interface Package {
  id: string; name: string; slug: string; description: string|null;
  base_price: number; mrp: number; test_count: number; badge: string|null;
  active: boolean; fasting_required: boolean; home_collection: boolean;
  category: string|null; sort_order: number;
}
export interface Lead {
  id: string; company_name: string; contact_name: string|null; contact_email: string|null;
  contact_phone: string|null; employee_count: number|null; city: string|null;
  status: string; source: string|null; notes: string|null; created_at: string;
}
export interface Enterprise {
  id: string; name: string; type: string; poc_name: string; poc_email: string;
  poc_phone: string; contract_start: string; contract_end: string;
  discount_pct: number; active: boolean; created_at: string;
}
export interface UserProfile {
  id: string; full_name: string; role: string; phone: string|null;
  department: string|null; designation: string|null; employee_id: string|null;
  is_active: boolean; created_at: string;
}

// Extended booking stages
export type BookingStage = 
  | "New"               // Just booked by patient
  | "Confirmed"         // Lab confirmed the slot
  | "In Progress"       // Patient arrived / sample collected
  | "Report Uploaded"   // Lab uploaded all reports
  | "Partially Uploaded"// Lab uploaded some, others skipped/not done
  | "Under Verification"// VR team reviewing
  | "Reports Received"  // All tests verified by VR team
  | "Rejected"          // Booking rejected
  | "No Show";          // Patient didn't arrive
