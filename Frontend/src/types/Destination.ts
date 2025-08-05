export interface Destination {
  _id?: string;
  title: string;
  location: string;
  price: number;
  description: string;
  image: string;
  days: number;
  featured?: boolean;
}