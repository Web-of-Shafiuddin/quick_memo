'use client';

import React, { useState, useEffect } from 'react';
import { domainService, CustomDomain, DNSInstructions } from '@/services/domainService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Globe,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Copy,
  Trash2,
  RefreshCw,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export default function CustomDomainPage() {
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingDomain, setAddingDomain] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [instructions, setInstructions] = useState<DNSInstructions | null>(null);
  const [verifyingDomain, setVerifyingDomain] = useState<number | null>(null);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const data = await domainService.getDomains();
      setDomains(data);
    } catch (error: any) {
      console.error('Error fetching domains:', error);

      if (error.response?.data?.code === 'CUSTOM_DOMAIN_NOT_ALLOWED') {
        toast.error('Custom domains require Premium or Enterprise plan');
      } else {
        toast.error(error.response?.data?.error || 'Failed to fetch domains');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDomain.trim()) {
      toast.error('Please enter a domain name');
      return;
    }

    try {
      setAddingDomain(true);
      const result = await domainService.addDomain(newDomain.trim());

      setInstructions(result.instructions);
      setNewDomain('');
      toast.success('Domain added! Please verify DNS ownership.');

      await fetchDomains();
    } catch (error: any) {
      console.error('Error adding domain:', error);

      if (error.response?.data?.code === 'CUSTOM_DOMAIN_NOT_ALLOWED') {
        toast.error('Custom domains require Premium or Enterprise plan. Please upgrade.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to add domain');
      }
    } finally {
      setAddingDomain(false);
    }
  };

  const handleVerifyDomain = async (domainId: number) => {
    try {
      setVerifyingDomain(domainId);
      const result = await domainService.verifyDomain(domainId);

      if (result.success) {
        toast.success(result.message);
        await fetchDomains();
      } else {
        if (result.instructions) {
          setInstructions(result.instructions);
        }
        toast.error('DNS verification failed. Please check your DNS records.');
      }
    } catch (error: any) {
      console.error('Error verifying domain:', error);
      toast.error(error.response?.data?.error || 'Failed to verify domain');
    } finally {
      setVerifyingDomain(null);
    }
  };

  const handleDeleteDomain = async (domainId: number, domainName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${domainName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await domainService.deleteDomain(domainId);
      toast.success('Domain deleted successfully');
      await fetchDomains();
      setInstructions(null);
    } catch (error: any) {
      console.error('Error deleting domain:', error);
      toast.error(error.response?.data?.error || 'Failed to delete domain');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getStatusBadge = (status: CustomDomain['status']) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      VERIFIED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle2, label: 'Verified' },
      ACTIVE: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Active' },
      SUSPENDED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Suspended' },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getSSLBadge = (sslStatus: CustomDomain['ssl_status']) => {
    const sslConfig = {
      PENDING: { color: 'bg-gray-100 text-gray-800', label: 'SSL Pending' },
      ISSUED: { color: 'bg-blue-100 text-blue-800', label: 'SSL Issued' },
      ACTIVE: { color: 'bg-green-100 text-green-800', label: 'SSL Active' },
      EXPIRED: { color: 'bg-red-100 text-red-800', label: 'SSL Expired' },
      FAILED: { color: 'bg-red-100 text-red-800', label: 'SSL Failed' },
    };

    const config = sslConfig[sslStatus];

    return (
      <Badge variant="outline" className={config.color}>
        <Shield className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="space-y-4">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Globe className="h-8 w-8" />
          Custom Domain
        </h1>
        <p className="text-muted-foreground mt-2">
          Use your own domain for complete brand ownership. Available on Premium and Enterprise plans.
        </p>
      </div>

      {/* Add Domain Form */}
      {domains.length === 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Your Custom Domain</CardTitle>
            <CardDescription>
              Connect your domain (e.g., mystore.com) to your shop
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDomain} className="flex gap-4">
              <Input
                type="text"
                placeholder="mystore.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                disabled={addingDomain}
                className="flex-1"
              />
              <Button type="submit" disabled={addingDomain}>
                {addingDomain ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Domain'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* DNS Instructions */}
      {instructions && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-4 mt-2">
              <h3 className="font-semibold">DNS Verification Required</h3>
              <p className="text-sm">
                Add this TXT record to your domain's DNS settings:
              </p>

              <div className="bg-muted p-4 rounded-md space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-muted-foreground">Type:</span>
                    <p className="font-mono">{instructions.type}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-xs font-mono text-muted-foreground">Host/Name:</span>
                    <p className="font-mono break-all">{instructions.host}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(instructions.host)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-xs font-mono text-muted-foreground">Value:</span>
                    <p className="font-mono break-all text-sm">{instructions.value}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(instructions.value)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-sm space-y-1">
                <p className="font-semibold">Instructions:</p>
                <ol className="list-decimal list-inside space-y-1">
                  {instructions.instructions.map((instruction, i) => (
                    <li key={i}>{instruction}</li>
                  ))}
                </ol>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ExternalLink className="h-4 w-4" />
                <span>DNS changes can take 5-30 minutes to propagate</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Domain List */}
      {domains.length > 0 ? (
        <div className="space-y-4">
          {domains.map((domain) => (
            <Card key={domain.domain_id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{domain.domain_name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusBadge(domain.status)}
                      {getSSLBadge(domain.ssl_status)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {domain.status === 'PENDING' && (
                      <Button
                        onClick={() => handleVerifyDomain(domain.domain_id)}
                        disabled={verifyingDomain === domain.domain_id}
                      >
                        {verifyingDomain === domain.domain_id ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Verify Domain
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteDomain(domain.domain_id, domain.domain_name)}
                      title="Delete domain"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Added:</span>
                    <p>{new Date(domain.created_at).toLocaleDateString()}</p>
                  </div>
                  {domain.verified_at && (
                    <div>
                      <span className="text-muted-foreground">Verified:</span>
                      <p>{new Date(domain.verified_at).toLocaleDateString()}</p>
                    </div>
                  )}
                  {domain.ssl_issued_at && (
                    <div>
                      <span className="text-muted-foreground">SSL Issued:</span>
                      <p>{new Date(domain.ssl_issued_at).toLocaleDateString()}</p>
                    </div>
                  )}
                  {domain.ssl_expires_at && (
                    <div>
                      <span className="text-muted-foreground">SSL Expires:</span>
                      <p>{new Date(domain.ssl_expires_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {domain.status === 'ACTIVE' && (
                  <Alert className="mt-4">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Your domain is active! Visitors can now access your shop at{' '}
                      <a
                        href={`https://${domain.domain_name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline"
                      >
                        {domain.domain_name}
                      </a>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Alert>
          <Globe className="h-4 w-4" />
          <AlertDescription>
            No custom domain configured. Add one to get started!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
