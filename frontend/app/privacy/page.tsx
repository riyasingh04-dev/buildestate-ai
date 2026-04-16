'use client';

import React from 'react';
import { ShieldCheck, Lock, Database, Eye, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';

const PrivacyPage = () => {
    return (
        <div className="flex flex-col">

            {/* Hero Section */}
            <section className="relative h-[400px] w-full bg-gradient-to-br from-blue-800 via-primary to-indigo-900 flex items-center overflow-hidden">
                <div className="absolute inset-0 opacity-20 mix-blend-overlay">
                    <img
                        src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=1200"
                        className="h-full w-full object-cover"
                        alt="Privacy"
                    />
                </div>
                {/* Decorative blobs */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                <motion.div 
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.8 }}
                   className="container mx-auto px-4 text-center z-10"
                >
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-md">
                        Your Privacy Matters <span className="inline-block animate-bounce">🔐</span>
                    </h1>
                    <p className="text-white/70 text-lg max-w-2xl mx-auto">
                        We are committed to protecting your personal data and ensuring complete transparency.
                    </p>
                </motion.div>
            </section>

            {/* Content Section */}
            <section className="container mx-auto px-4 py-20">

                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">How We Protect You</h2>
                    <p className="text-muted-foreground">
                        BuildEstate AI follows strict security and privacy practices to keep your data safe.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid md:grid-cols-2 gap-10">

                    {[
                        {
                            title: "Data Collection",
                            desc: "We collect essential data like email, login credentials, and property interests to improve your experience.",
                            icon: Database,
                            color: "bg-blue-50 text-blue-600"
                        },
                        {
                            title: "Data Usage",
                            desc: "Your data helps connect buyers with builders and enhance platform features.",
                            icon: Eye,
                            color: "bg-green-50 text-green-600"
                        },
                        {
                            title: "Security Measures",
                            desc: "We use industry-standard encryption and authentication systems to secure your data.",
                            icon: Lock,
                            color: "bg-purple-50 text-purple-600"
                        },
                        {
                            title: "No Data Selling",
                            desc: "We never sell your personal information. Your trust is our priority.",
                            icon: ShieldCheck,
                            color: "bg-indigo-50 text-indigo-600"
                        }
                    ].map((item, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            key={idx}
                            className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-lg shadow-blue-900/5 border border-gray-100 dark:border-zinc-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
                        >
                            <div className={`h-16 w-16 rounded-2xl ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <item.icon className="h-8 w-8" />
                            </div>

                            <h3 className="text-2xl font-bold mb-3 dark:text-white">{item.title}</h3>
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                {item.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="bg-muted/30 py-20 text-center">
                <div className="container mx-auto px-4">
                    <h3 className="text-2xl font-bold mb-4">
                        Still have questions about your privacy?
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        Our team is here to help you understand how your data is used.
                    </p>

                    <Link href="/register">
                        <Button className="px-6 py-3">
                            Contact Support
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section>

        </div>
    );
};

export default PrivacyPage;