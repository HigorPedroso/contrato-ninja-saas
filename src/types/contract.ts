export enum ContractStatus {
  DRAFT = 'draft',
  PENDING_USER_SIGNATURE = 'pending_user_signature',
  PENDING_CLIENT_SIGNATURE = 'pending_client_signature',
  SIGNED = 'signed',
  EXPIRED = 'expired',
  CANCELED = 'canceled',
  ACTIVE = "active"
}

export interface ContractSignature {
  signed_at: string;
  signed_file_path: string;
  signer_ip: string;
}

export interface Contract {
  [x: string]: string;
  id: string;
  title: string;
  content: string;
  type: string;
  status: ContractStatus;
  created_at: string;
  client_name?: string;
  client_email?: string;
  signed_file_path?: string;
  client_signed_file_path?: string;
  user_signature?: ContractSignature;
  client_signature?: ContractSignature;
}