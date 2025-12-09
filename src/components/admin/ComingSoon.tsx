import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Construction, 
  Calendar, 
  Lightbulb,
  ArrowRight,
  Clock
} from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features?: string[];
  estimatedDate?: string;
}

export const ComingSoon = ({ 
  title, 
  description, 
  icon: Icon, 
  features = [],
  estimatedDate = "Q2 2025"
}: ComingSoonProps) => {
  return (
    <div className="min-h-[600px] flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl border-0 shadow-lg bg-gradient-to-br from-background to-muted/50">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-6 p-4 rounded-full bg-gradient-to-br from-brand-orange/20 to-brand-orange/10 border border-brand-orange/20">
            <Icon className="h-12 w-12 text-brand-orange" />
          </div>
          <CardTitle className="text-3xl font-bold text-brand-navy mb-3">
            {title}
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground max-w-md mx-auto">
            {description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className="bg-gradient-to-r from-brand-orange to-brand-orange-light text-white px-4 py-2 text-sm font-medium">
              <Construction className="h-4 w-4 mr-2" />
              Under Development
            </Badge>
          </div>

          {/* Estimated Release */}
          <div className="text-center p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-5 w-5 text-brand-orange mr-2" />
              <span className="font-semibold text-brand-navy">Estimated Release</span>
            </div>
            <p className="text-2xl font-bold text-brand-orange">{estimatedDate}</p>
          </div>

          {/* Planned Features */}
          {features.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-brand-navy flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-brand-orange" />
                Planned Features
              </h3>
              <div className="grid gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center p-3 rounded-lg bg-background border border-border/50">
                    <ArrowRight className="h-4 w-4 text-brand-orange mr-3 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center pt-4">
            <Button 
              variant="outline" 
              className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white transition-all duration-300"
            >
              <Clock className="h-4 w-4 mr-2" />
              Stay Tuned for Updates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};