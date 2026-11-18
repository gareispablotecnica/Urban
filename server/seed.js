// ─────────────────────────────────────────────────────────────
//  PRODUCTOS DE EJEMPLO
//  Para poner tus fotos de Pinterest:
//   1. Abrí el pin → click derecho sobre la imagen → "Copiar dirección de imagen"
//      (tiene que ser algo como https://i.pinimg.com/736x/xx/xx/xx.jpg)
//   2. Pegala en el campo `image` del producto.
//   3. Borrá el archivo server/store.db y reiniciá el server para recargar.
//  Si `image` queda vacío, la web muestra un arte tipográfico de reemplazo.
// ─────────────────────────────────────────────────────────────

// Imagen de portada del Home (opcional, también de Pinterest)
export const HERO_IMAGE = "";

// category: hoodies | remeras | pantalones | camperas | zapatillas | accesorios
export const products = [
  { name: "Oversized Hoodie Void", category: "hoodies", price: 68000, old_price: null, color: "negro", sizes: "S,M,L,XL", tag: "NEW", image: "" },
  { name: "Hoodie Acid Wash", category: "hoodies", price: 72000, old_price: 89000, color: "gris", sizes: "M,L,XL", tag: "SALE", image: "" },
  { name: "Zip Hoodie Racer", category: "hoodies", price: 79000, old_price: null, color: "azul", sizes: "S,M,L", tag: "", image: "" },
  { name: "Boxy Tee Chrome", category: "remeras", price: 28000, old_price: null, color: "blanco", sizes: "S,M,L,XL", tag: "NEW", image: "" },
  { name: "Remera Graphic Tokyo", category: "remeras", price: 31000, old_price: 39000, color: "negro", sizes: "S,M,L,XL", tag: "SALE", image: "" },
  { name: "Longsleeve Distorted", category: "remeras", price: 36000, old_price: null, color: "verde", sizes: "M,L,XL", tag: "", image: "" },
  { name: "Cargo Pants Utility", category: "pantalones", price: 74000, old_price: null, color: "verde", sizes: "S,M,L,XL", tag: "HOT", image: "" },
  { name: "Baggy Jeans Stone", category: "pantalones", price: 69000, old_price: 82000, color: "azul", sizes: "S,M,L,XL", tag: "SALE", image: "" },
  { name: "Jogger Tech Fleece", category: "pantalones", price: 58000, old_price: null, color: "gris", sizes: "S,M,L", tag: "", image: "" },
  { name: "Cargo Parachute Beige", category: "pantalones", price: 76000, old_price: null, color: "beige", sizes: "M,L,XL", tag: "NEW", image: "" },
  { name: "Puffer Jacket Glacier", category: "camperas", price: 135000, old_price: null, color: "negro", sizes: "M,L,XL", tag: "HOT", image: "" },
  { name: "Varsity Jacket Downtown", category: "camperas", price: 118000, old_price: 142000, color: "rojo", sizes: "S,M,L,XL", tag: "SALE", image: "" },
  { name: "Windbreaker Neon", category: "camperas", price: 96000, old_price: null, color: "verde", sizes: "S,M,L", tag: "", image: "" },
  { name: "Chunky Sneakers Rave", category: "zapatillas", price: 125000, old_price: null, color: "blanco", sizes: "40,41,42,43,44", tag: "NEW", image: "" },
  { name: "High Top Street", category: "zapatillas", price: 108000, old_price: 128000, color: "negro", sizes: "39,40,41,42", tag: "SALE", image: "" },
  { name: "Gorra Trucker Faded", category: "accesorios", price: 19000, old_price: null, color: "beige", sizes: "U", tag: "", image: "" },
  { name: "Bucket Hat Reflect", category: "accesorios", price: 22000, old_price: null, color: "gris", sizes: "U", tag: "NEW", image: "" },
  { name: "Riñonera Crossbody", category: "accesorios", price: 34000, old_price: 42000, color: "negro", sizes: "U", tag: "SALE", image: "" },
];
