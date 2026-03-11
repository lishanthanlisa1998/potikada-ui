export interface Product {
  id:            number;
  name:          string;
  category:      string;
  image:         string;
  images:        string[];
  price:         number;
  originalPrice?: number;
  badge?:        string;
  offerTag?:     string;
  hearts?:       number;
  shareLink?:    string;
  unit?:         string;
  maker_label?:  string;
  maker_name?:   string;
  weight_grams?: number;
  stock?:        number;
  sizes?:        string[];   // ← add this
  deliveryPrice?: number;
  deliveryDate?:  string;
  description?:   string;
}