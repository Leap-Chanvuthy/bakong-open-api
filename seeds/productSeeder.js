require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('../src/config/db');
const Product = require('../src/api/models/Product');   

const products = [
  {
    name: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation and long battery life.",
    price: 1000,
    currency: "KHR",
    images: [
      "https://cdn.mos.cms.futurecdn.net/v2/t:0,l:0,cw:4032,ch:2268,q:80,w:4032/KfKJ7uGAXBxezdLqFMAZAR.jpg",
      "https://sm.pcmag.com/pcmag_au/photo/b/bose-quiet/bose-quietcomfort-ultra-headphones_wyy8.jpg",
      "https://b2c-contenthub.com/wp-content/uploads/2023/10/Bose-QuietComfort-Ultra-kit.jpg?quality=50&strip=all",
      "https://www.cnet.com/a/img/resize/786f389d842897d3d3a5f755e0116a3e3a480a6f/hub/2023/10/16/c01f0d6c-9947-4d7c-9ba3-e94194811ec2/bose-quietcomfort-ultra-headpones-smoke-white-10.jpg?auto=webp&width=1200"
    ],
    stock: 25
  },
  {
    name: "Smartphone",
    description: "Latest smartphone with powerful processor and high-resolution camera.",
    price: 1200,
    currency: "KHR",
    images: [
      "https://cdn.britannica.com/09/241709-050-149181B1/apple-iphone-11-2019.jpg",
      "https://www.silicon.co.uk/wp-content/uploads/2023/09/Apple-iPhone-15-Pro-lineup-02.jpg",
      "https://www.t-mobile.com/dialed-in/_admin/uploads/2024/07/iPhone15Plus-vs-ProMax-640x448.png",
      "https://www.telefonica.com/en/wp-content/uploads/sites/5/2024/12/smartphone.jpg"
    ],
    stock: 40
  },
  {
    name: "Running Shoes",
    description: "Comfortable and lightweight running shoes for daily workouts.",
    price: 1200,
    currency: "KHR",
    images: [
      "https://framerusercontent.com/images/CI2XMYReYsA3P7eqtWQo2WfzV0o.jpg",
      "https://athleticsweekly.com/wp-content/smush-webp/2023/12/Nike-Vaporfly3-750x442.jpg.webp",
      "https://s3.amazonaws.com/www.irunfar.com/wp-content/uploads/2024/05/15171202/Best-Trail-Running-Shoes-Hoka-Speedgoat-6-feature.jpg",
      "https://runkeeper.com/cms/wp-content/uploads/sites/4/2021/04/SS23_GEL-CUMULUS-25_Highlight_CHIASI0016_SH09_03_FINAL.jpg"
    ],
    stock: 50
  },
  {
    name: "Gaming Laptop",
    description: "Powerful gaming laptop with high refresh rate display and RTX graphics card.",
    price: 1100,
    currency: "KHR",
    images: [
      "https://sm.pcmag.com/pcmag_au/photo/m/msi-titan-/msi-titan-18-hx_r2s9.jpg",
      "https://jarrods.tech/wp-content/uploads/2023/12/asus-rog-zephyrus-m16-2023-gaming-laptop-1024x576.jpg",
      "https://s.yimg.com/uu/api/res/1.2/n0m7H738OH55xtiYZrcBJg--~B/Zmk9c3RyaW07aD03MjA7dz0xMjgwO2FwcGlkPXl0YWNoeW9u/https://s.yimg.com/os/creatr-uploaded-images/2023-05/577b5040-f0cb-11ed-8baa-32919eb8c47a",
      "https://thegadgetflow.com/wp-content/uploads/2022/06/The-best-gaming-laptops-to-buy-this-summer-blog-featured.jpeg"
    ],
    stock: 10
  }
];

const seedProducts = async () => {
  try {
    await connectDB(); 

    // Clean existing products
    await Product.deleteMany({});
    // Insert new products
    await Product.insertMany(products);

    console.log('✅ Product seeding completed successfully!');
    // close mongoose connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    try { await mongoose.connection.close(); } catch(_) {}
    process.exit(1);
  }
};

seedProducts();
