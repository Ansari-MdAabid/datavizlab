import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Github, Globe, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const Contact = () => {
    return (
        <div className="max-w-5xl w-full p-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
            >
                <div className="space-y-4">
                    <h1 className="text-5xl font-bold">Get in Touch</h1>
                    <p className="text-lg text-muted-foreground">
                        Have questions about the visualizations or want to collaborate? Reach out through any of these channels.
                    </p>
                </div>

                <div className="space-y-4">
                    {[
                        { icon: Mail, label: "Email", value: "contact@datavizlab.edu", href: "mailto:contact@datavizlab.edu" },
                        { icon: Github, label: "GitHub", value: "github.com/datavizlab", href: "https://github.com" },
                        { icon: Globe, label: "Website", value: "www.datavizlab.io", href: "#" }
                    ].map((link, i) => (
                        <a
                            key={i}
                            href={link.href}
                            className="flex items-center p-4 rounded-2xl border border-border/30 bg-card/10 hover:bg-card/20 hover:border-primary/50 transition-all group"
                        >
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mr-4 group-hover:scale-110 transition-transform">
                                <link.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase opacity-70">{link.label}</p>
                                <p className="font-semibold">{link.value}</p>
                            </div>
                        </a>
                    ))}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="bg-card/20 backdrop-blur-xl border-border/50 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16 rounded-full" />
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold">Send a Message</h3>
                            <p className="text-sm text-muted-foreground">We'll get back to you as soon as possible.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input placeholder="First Name" className="bg-background/20 border-border/40 h-12" />
                                <Input placeholder="Last Name" className="bg-background/20 border-border/40 h-12" />
                            </div>
                            <Input placeholder="Email Address" className="bg-background/20 border-border/40 h-12" />
                            <textarea
                                className="w-full min-h-[120px] rounded-lg bg-background/20 border border-border/40 p-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                                placeholder="Your Message..."
                            ></textarea>
                            <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all shadow-lg hover:shadow-primary/20">
                                <Send className="mr-2 h-4 w-4" />
                                Send Message
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default Contact;
