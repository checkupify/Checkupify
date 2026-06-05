export interface Package { id:string;name:string;description:string|null;base_price:number;mrp:number;test_count:number;badge:string|null;active:boolean;fasting_required:boolean;home_collection:boolean;category:string|null;sort_order:number; }
export interface Lab { id:string;name:string;city:string;address:string|null;nabl_certified:boolean;rating:number;avg_tat_hours:number;home_collection:boolean;home_collection_charge:number; }
export interface Booking { id:string;patient_name:string;appointment_date:string;slot_time:string;stage:string;amount:number;collection_type:string;report_url:string|null;created_at:string;lab?:{name:string}|null;package?:{name:string}|null; }
export interface UserData { id:string;phone:string;name:string;email:string;gender:string;city:string;dob:string; }
