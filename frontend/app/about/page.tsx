'use client';

import React from 'react';
import { Building2, ShieldCheck, Zap, Globe2, Users2, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

const AboutPage = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[400px] w-full bg-primary flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200" 
            className="h-full w-full object-cover" 
            alt="Business Architecture"
          />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white lg:text-7xl">
            Redefining <br />
            <span className="text-accent italic">Global Real Estate</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-white/70">
            BuildEstate AI is a premier ecosystem where world-class builders meet discerning buyers through a secure, AI-driven platform.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Listings', value: '1.2k+' },
              { label: 'Trusted Builders', value: '450+' },
              { label: 'Global Offices', value: '12+' },
              { label: 'Total Volume', value: '$850M+' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl font-black text-primary mb-1">{stat.value}</div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="mb-4 inline-flex items-center space-x-2 text-primary font-bold tracking-widest uppercase text-xs">
            <div className="h-1 w-8 bg-primary" />
            <span>Our Foundation</span>
          </div>
          <h2 className="text-4xl font-extrabold text-foreground mb-6">Built on Trust, Powered by Innovation</h2>
          <p className="text-lg text-muted-foreground">
            We didn't just build another property portal. We built a network of excellence, verification, and seamless communication.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              title: 'Verified Builders Only',
              description: 'Every builder on our platform undergoes a rigorous 20-point verification check to ensure project delivery and financial stability.',
              icon: ShieldCheck,
              color: 'bg-blue-50 text-blue-600'
            },
            {
              title: 'Real-Time Lead Tracking',
              description: 'Our proprietary matching algorithm connects the right buyers with the right developments, providing instant feedback to builders.',
              icon: Zap,
              color: 'bg-emerald-50 text-emerald-600'
            },
            {
              title: 'Global High-End Network',
              description: 'From New York penthouses to Bali villas, we curate only the most exceptional properties for our global community.',
              icon: Globe2,
              color: 'bg-indigo-50 text-indigo-600'
            }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-border shadow-sm hover:shadow-xl transition-all duration-300">
              <div className={`h-14 w-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6`}>
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200" 
                  alt="Modern Office" 
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-primary/20" />
              </div>
            </div>
            <div className="lg:w-1/2">
              <h3 className="text-3xl font-bold mb-6">Our Mission: Simplify the Path to Ownership</h3>
              <div className="space-y-6">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We believe that buying property should be an experience of joy, not stress. By bridging the gap between modern technology and real estate expertise, we provide a platform where transparency is the default, not the exception.
                </p>
                <div className="flex items-center space-x-4">
                   <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-primary shadow-md">
                      <Users2 className="h-6 w-6" />
                   </div>
                   <div>
                      <div className="font-bold">Member-Driven Ecosystem</div>
                      <div className="text-sm text-muted-foreground">Community of over 50,000 active users.</div>
                   </div>
                </div>
                <div className="flex items-center space-x-4">
                   <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-primary shadow-md">
                      <Building2 className="h-6 w-6" />
                   </div>
                   <div>
                      <div className="font-bold">Architectural Excellence</div>
                      <div className="text-sm text-muted-foreground">Curating only the most innovative designs.</div>
                   </div>
                </div>
              </div>
              <Link href="/register">
                 <Button className="mt-10 px-8 py-4">
                    Join the Network
                    <ArrowRight className="ml-2 h-5 w-5" />
                 </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
