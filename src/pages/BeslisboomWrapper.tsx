import React from 'react';
import { Beslisboom as BeslisboomComponent } from '@/components/Beslisboom/Beslisboom';
import potjesSoortBeslisboom from '@/components/Beslisboom/PotjesSoortBeslisboom.json';

const BeslisboomWrapper: React.FC = () => {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Potjessoort Beslisboom</h1>
            <BeslisboomComponent beslisboom={potjesSoortBeslisboom} />
        </div>
    );
};

export default BeslisboomWrapper;