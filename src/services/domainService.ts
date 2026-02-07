import api from './api';

export interface CustomDomain {
  domain_id: number;
  domain_name: string;
  status: 'PENDING' | 'VERIFIED' | 'ACTIVE' | 'SUSPENDED';
  verification_token: string;
  verified_at: string | null;
  ssl_status: 'PENDING' | 'ISSUED' | 'ACTIVE' | 'EXPIRED' | 'FAILED';
  ssl_issued_at: string | null;
  ssl_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DNSInstructions {
  type: string;
  name: string;
  host: string;
  value: string;
  ttl: number;
  instructions: string[];
}

export interface AddDomainResponse {
  success: boolean;
  data: {
    domain: CustomDomain;
    instructions: DNSInstructions;
  };
  message: string;
}

export interface DomainListResponse {
  success: boolean;
  data: CustomDomain[];
}

export interface DomainInstructionsResponse {
  success: boolean;
  data: DNSInstructions;
}

export interface VerifyDomainResponse {
  success: boolean;
  data: CustomDomain;
  message: string;
  instructions?: DNSInstructions;
}

export interface DeleteDomainResponse {
  success: boolean;
  message: string;
}

class DomainService {
  /**
   * Get all custom domains for the current user
   */
  async getDomains(): Promise<CustomDomain[]> {
    const response = await api.get<DomainListResponse>('/domains');
    return response.data.data;
  }

  /**
   * Add a new custom domain
   */
  async addDomain(domainName: string): Promise<AddDomainResponse['data']> {
    const response = await api.post<AddDomainResponse>('/domains', {
      domain_name: domainName,
    });
    return response.data.data;
  }

  /**
   * Verify domain ownership via DNS
   */
  async verifyDomain(domainId: number): Promise<VerifyDomainResponse> {
    const response = await api.post<VerifyDomainResponse>(
      `/domains/${domainId}/verify`
    );
    return response.data;
  }

  /**
   * Get DNS verification instructions for a domain
   */
  async getInstructions(domainId: number): Promise<DNSInstructions> {
    const response = await api.get<DomainInstructionsResponse>(
      `/domains/${domainId}/instructions`
    );
    return response.data.data;
  }

  /**
   * Delete a custom domain
   */
  async deleteDomain(domainId: number): Promise<void> {
    await api.delete<DeleteDomainResponse>(`/domains/${domainId}`);
  }
}

export const domainService = new DomainService();
