/**
 * Demo component to test ShadCN UI setup
 * 
 * This component can be imported anywhere to test the ShadCN installation.
 * To use: import { ShadcnDemo } from '@/components/ui/ShadcnDemo';
 */

import { Button } from '@/components/ui/button';

export function ShadcnDemo() {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">ShadCN UI is Working! 🎉</h2>
      
      <div className="space-x-2">
        <Button variant="default">Primary Button</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </div>

      <div className="space-x-2">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </div>

      <div className="p-4 border rounded-lg bg-card">
        <p className="text-card-foreground">
          This card uses Tailwind CSS classes and ShadCN theme variables.
        </p>
      </div>
    </div>
  );
}

