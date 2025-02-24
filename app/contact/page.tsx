'use client';

import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Здесь будет логика отправки формы
      toast({
        title: "Success",
        description: "Your message has been sent. We'll get back to you soon.",
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <div className="py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Contact Us</h1>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Contact Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Get in Touch</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <p>info@flatty.ai</p>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <p>+1 234 567 890</p>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <p>123 Real Estate Street, City, Country</p>
              </div>
            </div>
          </Card>

          {/* Contact Form */}
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  placeholder="Your message"
                  rows={4}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </Container>
  );
} 