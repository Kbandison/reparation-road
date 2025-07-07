import React from "react";
import Image from "next/image";
import { shopItems } from "@/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const HeartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-heart"
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const ShopPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div
        className="relative h-[300px] md:h-[400px] flex items-center justify-center bg-cover bg-center rounded-lg mb-8"
        style={{
          backgroundImage:
            "url('/20250626_0830_Vintage Desk Legacy_simple_compose_01jyp3brxdfdtbe2693rmngbcx.png')",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50 rounded-lg"></div>
        <div className="relative z-10 text-center text-white p-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Welcome to Our Shop
          </h1>
          <p className="text-lg md:text-xl mt-4">
            Find your favorite Reparation Road merchandise.
          </p>
        </div>
      </div>

      <div
        className="mb-12 p-6 rounded-lg shadow-lg overflow-hidden backdrop-filter backdrop-blur-lg bg-opacity-20 bg-white border border-opacity-30 border-white flex flex-col md:flex-row items-center justify-between gap-4"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px 0 rgba( 31, 38, 135, 0.37 )",
          backdropFilter: "blur( 10px )",
          WebkitBackdropFilter: "blur( 10px )",
          borderRadius: "10px",
          border: "1px solid rgba( 255, 255, 255, 0.18 )",
        }}
      >
        <div className="flex-grow flex flex-col sm:flex-row items-center gap-4 w-full">
          <Input
            type="search"
            placeholder="Search items..."
            className="w-full text-black"
          />
          <Button
            type="submit"
            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Search
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <select className="p-2 rounded-md border border-gray-300 bg-white text-black w-full sm:w-48">
            <option>Sort by: Price (Low to High)</option>
            <option>Sort by: Price (High to Low)</option>
            <option>Sort by: Name (A-Z)</option>
            <option>Sort by: Name (Z-A)</option>
          </select>
          <select className="p-2 rounded-md border border-gray-300 bg-white text-black w-full sm:w-auto">
            <option>Filter by: All</option>
            <option>Filter by: Shirts</option>
            <option>Filter by: Hoodies</option>
            <option>Filter by: Totes</option>
            <option>Filter by: Mugs</option>
            <option>Filter by: Caps</option>
            <option>Filter by: Water Bottles</option>
            <option>Filter by: Keychains</option>
            <option>Filter by: Notebooks</option>
            <option>Filter by: Pens</option>
            <option>Filter by: Sticker Packs</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {shopItems.map((item) => (
          <div
            key={item.id}
            className="relative p-6 rounded-lg shadow-lg overflow-hidden backdrop-filter backdrop-blur-lg bg-opacity-20 bg-white border border-opacity-30 border-white transform transition-transform duration-300 hover:scale-105"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 32px 0 rgba( 31, 38, 135, 0.37 )",
              backdropFilter: "blur( 10px )",
              WebkitBackdropFilter: "blur( 10px )",
              borderRadius: "10px",
              border: "1px solid rgba( 255, 255, 255, 0.18 )",
            }}
          >
            <button className="absolute top-4 right-4 text-gray-800 hover:text-red-500">
              <HeartIcon />
            </button>
            <Image
              src={item.image}
              alt={item.name}
              width={300}
              height={200}
              className="w-full h-48 object-contain mb-4 rounded-md"
            />
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">
              {item.name}
            </h2>
            <p className="text-gray-600 mb-4 flex-grow">{item.description}</p>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold text-gray-900">
                ${item.price.toFixed(2)}
              </span>
              <div className="flex items-center">
                <Button variant="outline" size="sm" className="px-2 py-1">
                  -
                </Button>
                <Input
                  type="number"
                  defaultValue={1}
                  min={1}
                  className="w-16 text-center mx-2 text-black"
                />
                <Button variant="outline" size="sm" className="px-2 py-1">
                  +
                </Button>
              </div>
            </div>
            <Button className="w-full">Add to Cart</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopPage;
