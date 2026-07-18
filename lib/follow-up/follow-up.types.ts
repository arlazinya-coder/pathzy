import type { ApplicationContact, ApplicationContactType } from "@/lib/applications/smart-application.types";

export type FollowUpType =
  | "application_follow_up"
  | "recruiter_follow_up"
  | "interview_thank_you"
  | "interview_status_follow_up"
  | "referral_thank_you"
  | "offer_response"
  | "custom";

export type FollowUpStatus = "suggested" | "scheduled" | "drafted" | "approved" | "sent" | "dismissed" | "cancelled";

export type FollowUpRecipient = {
  contactId?: string;
  contactType?: ApplicationContactType;
  name?: string;
  email?: string;
  label: string;
  known: boolean;
};

export type FollowUpApproval = {
  approved: boolean;
  approvedAt?: string;
  approvedByUserId?: string;
};

export type ApplicationFollowUp = {
  id: string;
  user_id: string;
  application_id: string;
  follow_up_type: FollowUpType;
  status: FollowUpStatus;
  recommended_date: string | null;
  scheduled_date: string | null;
  sent_at: string | null;
  recipient_json: FollowUpRecipient;
  subject: string;
  body: string;
  approval_json: FollowUpApproval;
  timezone: string;
  timing_reason: string;
  duplicate_key: string;
  created_at: string;
  updated_at: string;
};

export type FollowUpApplicationContext = {
  id: string;
  user_id?: string;
  company_name?: string | null;
  role?: string | null;
  status?: string | null;
  source?: string | null;
  application_date?: string | null;
  follow_up_date?: string | null;
  closing_date?: string | null;
  planned_application_date?: string | null;
  interview_date?: string | null;
  expected_response_date?: string | null;
  next_action_date?: string | null;
  next_action?: string | null;
  follow_up_state?: string | null;
  contacts_json?: ApplicationContact[] | null;
  notes?: string | null;
};
