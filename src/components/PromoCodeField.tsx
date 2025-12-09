
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, Gift } from 'lucide-react';

interface PromoCodeFieldProps {
  value?: string;
  onChange: (value: string) => void;
  onPromoApplied?: (promotionId: string) => void;
}

export const PromoCodeField: React.FC<PromoCodeFieldProps> = ({ 
  value = '', 
  onChange, 
  onPromoApplied 
}) => {
  const [hasAutoFilled, setHasAutoFilled] = useState(false);

  useEffect(() => {
    // Auto-fill from session storage if available and field is empty
    const sessionPromoCode = sessionStorage.getItem('zira_promo_code');
    const sessionPromotionId = sessionStorage.getItem('zira_promotion_id');
    
    if (sessionPromoCode && !value && !hasAutoFilled) {
      onChange(sessionPromoCode);
      setHasAutoFilled(true);
      
      if (onPromoApplied && sessionPromotionId) {
        onPromoApplied(sessionPromotionId);
      }
    }
  }, [value, onChange, onPromoApplied, hasAutoFilled]);

  return (
    <div className="space-y-2">
      <Label htmlFor="promo_code" className="flex items-center gap-2">
        <Gift className="h-4 w-4" />
        Promo Code (Optional)
      </Label>
      <div className="relative">
        <Input
          id="promo_code"
          name="promo_code"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter promo code if you have one"
          className="pr-20"
        />
        {hasAutoFilled && (
          <Badge 
            variant="secondary" 
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-green-100 text-green-700 border-green-300"
          >
            <Check className="h-3 w-3 mr-1" />
            Applied
          </Badge>
        )}
      </div>
      {hasAutoFilled && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <Check className="h-3 w-3" />
          Promo code from your recent offer has been applied
        </p>
      )}
    </div>
  );
};
