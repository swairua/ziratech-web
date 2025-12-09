import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Lightbulb, Award } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: <Target className="h-8 w-8 text-brand-indigo" />,
      title: "Problem-Solving Focus",
      description: "We identify real challenges facing African businesses and build practical, scalable solutions that deliver measurable results."
    },
    {
      icon: <Users className="h-8 w-8 text-brand-lime" />,
      title: "Local Understanding",
      description: "As a Kenyan company, we understand the unique needs, constraints, and opportunities in African markets."
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-brand-indigo" />,
      title: "Innovation",
      description: "We leverage cutting-edge technology to create innovative solutions that are accessible and easy to use for businesses of all sizes."
    },
    {
      icon: <Award className="h-8 w-8 text-brand-lime" />,
      title: "Quality & Reliability",
      description: "Our platforms are built to enterprise standards with robust security, scalability, and 24/7 reliability."
    }
  ];

  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              About Zira Technologies
            </h2>
            <p className="text-xl text-muted-foreground">
              Empowering African businesses with smart technology solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
              <p className="text-muted-foreground mb-6">
                To democratize access to powerful business technology across Africa by building 
                smart, affordable, and practical digital platforms that solve real problems for 
                businesses of all sizes.
              </p>
              
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
              <p className="text-muted-foreground">
                A connected Africa where every business - from startups to enterprises - 
                has access to the digital tools they need to thrive, grow, and contribute 
                to economic development across the continent.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-brand-indigo/5 to-brand-lime/5 p-8 rounded-lg border border-brand-indigo/10">
              <h3 className="text-2xl font-bold text-foreground mb-4">Why Choose Zira?</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-brand-indigo rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Built specifically for African business needs</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-brand-lime rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Affordable pricing that scales with your business</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-brand-indigo rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Local support and customer service</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-brand-lime rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Proven track record with businesses across Kenya</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                    {value.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-3">{value.title}</h4>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;