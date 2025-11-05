
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OfferPopup } from '@/components/OfferPopup';

interface Promotion {
  title: string;
  description: string;
  offer_text: string;
  code: string | null;
  background_color: string;
  text_color: string;
  button_color: string;
  button_text: string;
  expires_at: string | null;
  theme: string;
  popup_size: string;
}

interface OfferPreviewProps {
  promotion: Promotion;
}

export const OfferPreview: React.FC<OfferPreviewProps> = ({ promotion }) => {
  // Mock promotion data for preview
  const mockPromotion = {
    id: 'preview',
    ...promotion,
    trigger_type: 'page_load' as const,
    trigger_value: 0,
    target_pages: [],
    max_displays_per_user: 1,
    status: 'active' as const,
    discount_percentage: 15,
    discount_amount: null
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Preview</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Preview Container */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-lg min-h-[500px] flex items-center justify-center relative overflow-hidden">
          {/* Mock Website Background */}
          <div className="absolute inset-4 bg-white rounded shadow-sm opacity-50">
            <div className="p-4 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="space-y-2 mt-6">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
              </div>
            </div>
          </div>

          {/* Popup Preview - using actual OfferPopup component */}
          <div className="relative z-10 w-full flex items-center justify-center">
            <div className="relative">
              {/* We'll render the popup inline for preview */}
              <div className="animate-scale-in">
                <OfferPopup 
                  currentPath="/preview" 
                  previewMode={true}
                  previewPromotion={mockPromotion}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Preview Information:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• This shows how your offer will appear to visitors</li>
            <li>• Size: {promotion.popup_size} (responsive design adapts to screen size)</li>
            <li>• Theme: {promotion.theme} color scheme</li>
            <li>• Promo code {promotion.code ? `"${promotion.code}"` : 'not set'} - will auto-fill in forms when claimed</li>
            <li>• The popup will appear based on your trigger settings in the live environment</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
