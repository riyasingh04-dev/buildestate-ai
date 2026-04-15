import React from 'react';
import Link from 'next/link';
import { MapPin, DollarSign, ArrowUpRight } from 'lucide-react';
import Button from './ui/Button';

interface PropertyCardProps {
  id: number;
  title: string;
  price: number;
  location: string;
  description: string;
  image_url?: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ id, title, price, location, description, image_url }) => {
  const defaultImage = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop";
  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {/* Placeholder image logic */}
        <div className="flex h-full w-full items-center justify-center bg-indigo-50 text-indigo-200">
           <img 
            src={image_url || defaultImage} 
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="absolute top-4 right-4 rounded-full bg-background/90 px-3 py-1 text-sm font-semibold text-primary backdrop-blur-sm shadow-sm">
          ${price.toLocaleString()}
        </div>
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-1 h-4 w-4 text-accent" />
          {location}
        </div>
        <h3 className="mb-2 text-xl font-bold text-foreground line-clamp-1">{title}</h3>
        <p className="mb-5 text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>

        <Link href={`/properties/${id}`}>
          <Button variant="outline" className="w-full group/btn">
            View Details
            <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard;
