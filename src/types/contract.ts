export enum ContractStatus {
  DRAFT = 'draft',
  PENDING_USER_SIGNATURE = 'pending_user_signature',
  PENDING_CLIENT_SIGNATURE = 'pending_client_signature',
  SIGNED = 'signed',
  EXPIRED = 'expired',
  CANCELED = 'canceled'
}

export interface ContractSignature {
  signed_at: string;
  signed_file_path: string;
  signer_ip: string;
}

export interface Contract {
  id: string;
  title: string;
  content: string;
  type: string;
  status: ContractStatus;
  created_at: string;
  client_name?: string;
  client_email?: string;
  user_signature?: ContractSignature;
  client_signature?: ContractSignature;
}