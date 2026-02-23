export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type RecordType =
  | 'condition'
  | 'medication'
  | 'visit'
  | 'lab'
  | 'imaging'
  | 'procedure'
  | 'vaccination'
  | 'allergy';

export type RecordStatus = 'active' | 'resolved' | 'discontinued';

export type AccessLevel = 'full' | 'relevant' | 'summary_only';

export type ShareAccessLevel = 'full' | 'filtered' | 'summary';

export interface User {
  id: string;
  full_name: string | null;
  date_of_birth: string | null;
  blood_type: BloodType | null;
  allergies: string[];
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  created_at: string;
}

export interface HealthRecord {
  id: string;
  user_id: string;
  type: RecordType;
  title: string;
  description: string | null;
  date: string;
  end_date: string | null;
  status: RecordStatus;
  provider_name: string | null;
  specialty: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  document_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: string;
  user_id: string;
  name: string;
  specialty: string | null;
  clinic_name: string | null;
  email: string | null;
  phone: string | null;
  has_access: boolean;
  access_level: AccessLevel;
  invited_at: string | null;
  accepted_at: string | null;
  created_at: string;
}

export interface ShareLink {
  id: string;
  user_id: string;
  token: string;
  recipient_name: string | null;
  purpose: string | null;
  access_level: ShareAccessLevel;
  filter_specialties: string[];
  expires_at: string | null;
  viewed_at: string | null;
  view_count: number;
  is_active: boolean;
  created_at: string;
}

export interface AISummary {
  id: string;
  user_id: string;
  specialty: string;
  summary: string;
  key_conditions: string[];
  current_medications: string[];
  recent_visits: string[];
  cautions: string[];
  generated_at: string;
}

export const SPECIALTIES = [
  'Primary Care',
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Neurology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Psychiatry',
  'Pulmonology',
  'Rheumatology',
  'Urology',
  'Gynecology',
  'Pediatrics',
  'Emergency Medicine',
  'Surgery',
  'Radiology',
  'Pathology',
  'Anesthesiology',
  'Allergy & Immunology',
  'Physical Therapy',
  'Other',
] as const;

export const RECORD_TYPES: { value: RecordType; label: string }[] = [
  { value: 'condition', label: 'Condition' },
  { value: 'medication', label: 'Medication' },
  { value: 'visit', label: 'Visit' },
  { value: 'lab', label: 'Lab Result' },
  { value: 'imaging', label: 'Imaging' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'allergy', label: 'Allergy' },
];

export const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
