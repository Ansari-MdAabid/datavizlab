import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

const PlaceholderLab = ({ name, type, setLeftPanelContent, setRightPanelContent }) => {

    useEffect(() => {
        setLeftPanelContent(
            <div className="space-y-4 animate-in slide-in-from-left duration-300">
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        <Construction className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>Controls for {name}</p>
                        <p className="text-xs mt-2">Coming Soon</p>
                    </CardContent>
                </Card>
            </div>
        );

        setRightPanelContent(
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        <p className="font-mono text-sm">Waiting for implementation...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }, [name, setLeftPanelContent, setRightPanelContent]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <div className="p-8 rounded-full bg-accent/20 mb-6 animate-pulse">
                <Construction className="h-24 w-24 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">{name}</h2>
            <p className="text-lg">Category: {type}</p>
            <p className="max-w-md text-center mt-4 opacity-70">
                This algorithm is part of the expanded curriculum and will be implemented in a future update.
            </p>
        </div>
    );
};

export default PlaceholderLab;
