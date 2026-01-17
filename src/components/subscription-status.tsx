'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, CheckCircle2, Clock } from 'lucide-react';

interface SubscriptionStatusProps {
    profileId?: string;
    isPro: boolean;
    proExpiry?: string;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ isPro, proExpiry }) => {
    if (!isPro) {
        return null;
    }

    const expiryDate = proExpiry ? new Date(proExpiry) : null;
    const daysRemaining = expiryDate
        ? Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Crown className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-semibold">Pro Account</p>
                                <Badge variant="default" className="bg-primary">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Active
                                </Badge>
                            </div>
                            {expiryDate && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3" />
                                    {daysRemaining > 0
                                        ? `${daysRemaining} days remaining`
                                        : 'Expires today'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default SubscriptionStatus;
