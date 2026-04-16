'use client';

import React from 'react';
import { FileText, ShieldAlert, UserCheck, Gavel, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';

const TermsPage = () => {
    return (
        <div className="flex flex-col">

            {/* Hero Section */}
            <section className="relative h-[400px] w-full bg-gradient-to-tr from-purple-900 via-primary to-blue-800 flex items-center overflow-hidden">
                <div className="absolute inset-0 opacity-20 mix-blend-overlay">
                    <img
                        src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1200"
                        className="h-full w-full object-cover"
                        alt="Terms"
                    />
                </div>
                {/* Decorative blobs */}
                <div className="absolute top-0 -right-24 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ duration: 0.8, ease: "easeOut" }}
                   className="container mx-auto px-4 text-center z-10"
                >
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg">
                        Terms & Conditions 📜
                    </h1>
                    <p className="text-white/70 text-lg max-w-2xl mx-auto">
                        Please read these terms carefully before using BuildEstate AI.
                    </p>
                </motion.div>
            </section>

            {/* Content Section */}
            <section className="container mx-auto px-4 py-20">

                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Platform Rules & Responsibilities</h2>
                    <p className="text-muted-foreground">
                        These guidelines ensure a safe and reliable experience for all users.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid md:grid-cols-2 gap-10">

                    {[
                        {
                            title: "Platform Usage",
                            desc: "Users must use BuildEstate AI only for lawful purposes and avoid misuse of any feature.",
                            icon: FileText,
                            color: "bg-blue-50 text-blue-600"
                        },
                        {
                            title: "No Fake Listings",
                            desc: "Builders must provide accurate property details. Fake listings may result in account suspension.",
                            icon: ShieldAlert,
                            color: "bg-red-50 text-red-600"
                        },
                        {
                            title: "User Responsibility",
                            desc: "Users are responsible for verifying property details before making any purchase decisions.",
                            icon: UserCheck,
                            color: "bg-green-50 text-green-600"
                        },
                        {
                            title: "Admin Rights",
                            desc: "Admins reserve the right to remove listings, block users, or take action to maintain platform integrity.",
                            icon: Gavel,
                            color: "bg-purple-50 text-purple-600"
                        }
                    ].map((item, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.15 }}
                            key={idx}
                            className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-lg shadow-purple-900/5 border border-gray-100 dark:border-zinc-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
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

            {/* CTA Section */}
            <section className="bg-muted/30 py-20 text-center">
                <div className="container mx-auto px-4">
                    <h3 className="text-2xl font-bold mb-4">
                        Agree with our terms and ready to explore?
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        Join BuildEstate AI and start your real estate journey today.
                    </p>

                    <Link href="/register">
                        <Button className="px-6 py-3">
                            Get Started
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section>

        </div>
    );
};

export default TermsPage;