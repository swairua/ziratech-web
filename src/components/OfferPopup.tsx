
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Gift, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Promotion {
  id: string;
  title: string;
  description: string;
  offer_text: string;
  discount_percentage: number | null;
  discount_amount: number | null;
  code: string | null;
  background_color: string;
  text_color: string;
  button_color: string;
  button_text: string;
  trigger_type: 'page_load' | 'exit_intent' | 'scroll_percentage' | 'time_delay';
  trigger_value: number;
  target_pages: string[];
  max_displays_per_user: number;
  expires_at: string | null;
  redirect_url?: string;
  theme: string;
  popup_size: string;
}

interface OfferPopupProps {
  currentPath: string;
  previewMode?: boolean;
  previewPromotion?: Promotion;
}

export const OfferPopup: React.FC<OfferPopupProps> = ({ currentPath, previewMode = false, previewPromotion }) => {
  const [activePromotion, setActivePromotion] = useState<Promotion | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [isClaimedThisSession, setIsClaimedThisSession] = useState(false);
  const { toast } = useToast();

  const trackEvent = async (eventType: string, promotionId?: string) => {
    if (!promotionId || previewMode) return;
    
    try {
      await supabase.from('offer_events').insert({
        promotion_id: promotionId,
        session_id: sessionId,
        event_type: eventType,
        page_path: currentPath,
        user_agent: navigator.userAgent,
        promo_code: activePromotion?.code,
        metadata: {
          theme: activePromotion?.theme,
          popup_size: activePromotion?.popup_size,
          page_path: currentPath
        }
      });
    } catch (error) {
      console.error('Error tracking offer event:', error);
    }
  };

  const getStorageKey = (promotionId: string) => `offer_displayed_${promotionId}`;

  const getDisplayCount = (promotionId: string): number => {
    const count = localStorage.getItem(getStorageKey(promotionId));
    return count ? parseInt(count, 10) : 0;
  };

  const incrementDisplayCount = (promotionId: string) => {
    const currentCount = getDisplayCount(promotionId);
    localStorage.setItem(getStorageKey(promotionId), (currentCount + 1).toString());
  };

  const shouldShowPromotion = (promotion: Promotion): boolean => {
    if (isClaimedThisSession) return false;
    
    if (promotion.target_pages.length > 0 && !promotion.target_pages.includes(currentPath)) {
      return false;
    }

    if (getDisplayCount(promotion.id) >= promotion.max_displays_per_user) {
      return false;
    }

    if (promotion.expires_at && new Date(promotion.expires_at) < new Date()) {
      return false;
    }

    return true;
  };

  const showPromotion = (promotion: Promotion) => {
    setActivePromotion(promotion);
    setIsVisible(true);
    incrementDisplayCount(promotion.id);
    trackEvent('displayed', promotion.id);
  };

  const closePopup = () => {
    if (activePromotion) {
      trackEvent('closed', activePromotion.id);
    }
    setIsVisible(false);
    setActivePromotion(null);
  };

  const handleClaim = async () => {
    if (!activePromotion) return;
    
    try {
      await trackEvent('claimed', activePromotion.id);
      setIsClaimedThisSession(true);
      
      // Store promo code in session storage for form auto-fill
      if (activePromotion.code) {
        sessionStorage.setItem('zira_promo_code', activePromotion.code);
        sessionStorage.setItem('zira_promotion_id', activePromotion.id);
        
        await navigator.clipboard.writeText(activePromotion.code);
        toast({
          title: "Offer Claimed! 🎉",
          description: `Promo code "${activePromotion.code}" copied and will auto-fill in forms.`,
        });
      } else {
        toast({
          title: "Offer Claimed! 🎉",
          description: "Your special offer has been activated.",
        });
      }
      
      if (activePromotion.redirect_url) {
        setTimeout(() => {
          window.open(activePromotion.redirect_url, '_blank');
        }, 1000);
      }
      
      setTimeout(() => {
        closePopup();
      }, 2000);
      
    } catch (error) {
      console.error('Error claiming offer:', error);
      toast({
        title: "Oops!",
        description: "There was an issue claiming your offer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExitIntent = (e: MouseEvent) => {
    if (e.clientY <= 0 && !isVisible && activePromotion?.trigger_type === 'exit_intent') {
      showPromotion(activePromotion);
    }
  };

  const handleScroll = () => {
    if (!activePromotion || activePromotion.trigger_type !== 'scroll_percentage' || isVisible) return;

    const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    if (scrollPercentage >= activePromotion.trigger_value) {
      showPromotion(activePromotion);
    }
  };

  useEffect(() => {
    if (previewMode && previewPromotion) {
      setActivePromotion(previewPromotion);
      setIsVisible(true);
      return;
    }

    const fetchPromotions = async () => {
      try {
        const { data: promotions, error } = await supabase
          .from('promotions')
          .select('*')
          .eq('status', 'active')
          .or(`target_pages.cs.{${currentPath}},target_pages.eq.{}`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const validPromotion = promotions?.find(shouldShowPromotion);
        if (!validPromotion) return;

        setActivePromotion(validPromotion);

        switch (validPromotion.trigger_type) {
          case 'page_load':
            setTimeout(() => showPromotion(validPromotion), 1000);
            break;
          case 'time_delay':
            setTimeout(() => showPromotion(validPromotion), validPromotion.trigger_value * 1000);
            break;
          case 'exit_intent':
            document.addEventListener('mouseleave', handleExitIntent);
            break;
          case 'scroll_percentage':
            window.addEventListener('scroll', handleScroll);
            break;
        }
      } catch (error) {
        console.error('Error fetching promotions:', error);
      }
    };

    if (!previewMode) {
      fetchPromotions();
    }

    return () => {
      document.removeEventListener('mouseleave', handleExitIntent);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentPath, previewMode, previewPromotion]);

  if (!isVisible || !activePromotion) return null;

  // Size configurations
  const sizeClasses = {
    compact: 'max-w-xs',
    standard: 'max-w-md',
    large: 'max-w-lg'
  };

  const popupSizeClass = sizeClasses[activePromotion.popup_size as keyof typeof sizeClasses] || sizeClasses.standard;

  const containerClasses = previewMode 
    ? "relative w-full max-w-lg mx-auto" 
    : "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4";

  return (
    <div className={containerClasses}>
      <Card 
        className={`relative ${popupSizeClass} w-full mx-auto animate-scale-in border-2 shadow-2xl`}
        style={{
          backgroundColor: activePromotion.background_color,
          color: activePromotion.text_color,
          borderColor: `${activePromotion.button_color}60`,
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px ${activePromotion.button_color}30`
        }}
      >
        <div className={`${activePromotion.popup_size === 'compact' ? 'p-3' : 'p-4 md:p-6'}`}>
          <Button
            variant="ghost"
            size="icon"
            onClick={closePopup}
            className={`absolute ${activePromotion.popup_size === 'compact' ? 'top-2 right-2 h-6 w-6' : 'top-3 right-3 h-8 w-8'} rounded-full hover:bg-white/20 transition-all duration-200`}
            style={{ color: `${activePromotion.text_color}80` }}
          >
            <X className={`${activePromotion.popup_size === 'compact' ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </Button>

          <div className={`text-center ${activePromotion.popup_size === 'compact' ? 'space-y-2' : 'space-y-4 md:space-y-6'}`}>
            {/* Icon with glow effect */}
            <div className="flex justify-center relative">
              <div 
                className="absolute inset-0 rounded-full blur-xl opacity-30 animate-pulse"
                style={{ backgroundColor: activePromotion.button_color }}
              ></div>
              <div 
                className={`relative ${activePromotion.popup_size === 'compact' ? 'p-2' : 'p-3 md:p-4'} rounded-full`}
                style={{ backgroundColor: `${activePromotion.button_color}20` }}
              >
                {isClaimedThisSession ? (
                  <Check 
                    className={`${activePromotion.popup_size === 'compact' ? 'h-5 w-5' : 'h-8 w-8 md:h-12 md:w-12'} animate-bounce`} 
                    style={{ color: activePromotion.button_color }}
                  />
                ) : (
                  <Gift 
                    className={`${activePromotion.popup_size === 'compact' ? 'h-5 w-5' : 'h-8 w-8 md:h-12 md:w-12'} animate-pulse`} 
                    style={{ color: activePromotion.button_color }}
                  />
                )}
              </div>
            </div>

            {/* Title and description */}
            <div className={`${activePromotion.popup_size === 'compact' ? 'space-y-1' : 'space-y-2 md:space-y-3'}`}>
              <h3 
                className={`${activePromotion.popup_size === 'compact' ? 'text-lg' : 'text-xl md:text-3xl'} font-bold leading-tight`}
                style={{ color: activePromotion.text_color }}
              >
                {isClaimedThisSession ? "Offer Claimed!" : activePromotion.title}
              </h3>
              {activePromotion.description && !isClaimedThisSession && (
                <p 
                  className={`${activePromotion.popup_size === 'compact' ? 'text-xs' : 'text-sm md:text-base'} leading-relaxed ${activePromotion.popup_size === 'compact' ? 'max-w-xs' : 'max-w-sm'} mx-auto opacity-90`}
                  style={{ color: activePromotion.text_color }}
                >
                  {activePromotion.description}
                </p>
              )}
              {isClaimedThisSession && (
                <p 
                  className={`${activePromotion.popup_size === 'compact' ? 'text-xs' : 'text-sm md:text-base'} leading-relaxed`}
                  style={{ color: activePromotion.button_color }}
                >
                  Your special offer is now active!
                </p>
              )}
            </div>

            {/* Offer highlight */}
            {!isClaimedThisSession && (
              <div 
                className={`${activePromotion.popup_size === 'compact' ? 'py-2 px-2' : 'py-4 md:py-6 px-4'} rounded-xl backdrop-blur-sm border`}
                style={{ 
                  backgroundColor: `${activePromotion.text_color}10`,
                  borderColor: `${activePromotion.text_color}20`
                }}
              >
                <div 
                  className={`${activePromotion.popup_size === 'compact' ? 'text-lg mb-1' : 'text-2xl md:text-4xl mb-2 md:mb-3'} font-black leading-none`}
                  style={{ color: activePromotion.button_color }}
                >
                  {activePromotion.offer_text}
                </div>
                {activePromotion.code && (
                  <div 
                    className={`rounded-lg ${activePromotion.popup_size === 'compact' ? 'p-1' : 'p-2 md:p-3'} inline-block`}
                    style={{ backgroundColor: `${activePromotion.text_color}20` }}
                  >
                    <span 
                      className={`${activePromotion.popup_size === 'compact' ? 'text-xs' : 'text-xs md:text-sm'} opacity-70`}
                      style={{ color: activePromotion.text_color }}
                    >
                      Use code:
                    </span>
                    <div 
                      className={`font-mono font-bold ${activePromotion.popup_size === 'compact' ? 'text-sm' : 'text-sm md:text-lg'} tracking-wide`}
                      style={{ color: activePromotion.button_color }}
                    >
                      {activePromotion.code}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action button */}
            <Button
              onClick={handleClaim}
              disabled={isClaimedThisSession}
              className={`w-full ${activePromotion.popup_size === 'compact' ? 'py-2 text-sm' : 'py-3 md:py-4 text-base md:text-lg'} font-bold transition-all duration-300 hover:scale-105 border-2 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              style={{
                backgroundColor: activePromotion.button_color,
                color: activePromotion.background_color,
                borderColor: activePromotion.button_color
              }}
            >
              {isClaimedThisSession ? (
                <span className="flex items-center gap-2">
                  <Check className={`${activePromotion.popup_size === 'compact' ? 'h-3 w-3' : 'h-4 w-4 md:h-5 md:w-5'}`} />
                  Claimed Successfully!
                </span>
              ) : (
                activePromotion.button_text
              )}
            </Button>

            {/* Footer info */}
            <div className={`${activePromotion.popup_size === 'compact' ? 'space-y-1 text-xs' : 'space-y-1 md:space-y-2 text-xs md:text-sm'} opacity-60`}>
              <p style={{ color: activePromotion.text_color }}>
                {activePromotion.expires_at 
                  ? `Expires: ${new Date(activePromotion.expires_at).toLocaleDateString()}`
                  : 'Limited time offer'
                }
              </p>
              {isClaimedThisSession && activePromotion.code && (
                <p style={{ color: activePromotion.button_color }}>
                  Code will auto-fill in contact forms
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
