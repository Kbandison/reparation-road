"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { shopItems } from "@/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { CartButton } from "@/components/cart";
import { Heart, ShoppingCart, Check } from "lucide-react";

type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
type FilterOption = 'all' | string;

const ShopPage = () => {
  const { addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('price-asc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [addedItems, setAddedItems] = useState<Record<number, boolean>>({});

  const getQuantity = (id: number) => quantities[id] || 1;

  const updateQuantity = (id: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  const handleAddToCart = (item: typeof shopItems[0]) => {
    addItem({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      type: item.type,
    }, getQuantity(item.id));

    // Show added feedback
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [item.id]: false }));
    }, 2000);

    // Reset quantity
    setQuantities(prev => ({ ...prev, [item.id]: 1 }));
  };

  // Get unique types for filter
  const itemTypes = useMemo(() => {
    const types = [...new Set(shopItems.map(item => item.type))];
    return types.sort();
  }, []);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = [...shopItems];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filterBy !== 'all') {
      result = result.filter(item => item.type === filterBy);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return result;
  }, [searchQuery, sortBy, filterBy]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
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

        {/* Cart Button */}
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-white rounded-full shadow-lg p-1">
            <CartButton />
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            type="button"
            className="w-full sm:w-auto bg-brand-green hover:bg-brand-darkgreen text-white font-bold py-2 px-4 rounded"
          >
            Search
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <select
            className="p-2 rounded-md border border-gray-300 bg-white text-black w-full sm:w-48"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="price-asc">Sort by: Price (Low to High)</option>
            <option value="price-desc">Sort by: Price (High to Low)</option>
            <option value="name-asc">Sort by: Name (A-Z)</option>
            <option value="name-desc">Sort by: Name (Z-A)</option>
          </select>
          <select
            className="p-2 rounded-md border border-gray-300 bg-white text-black w-full sm:w-auto"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option value="all">Filter by: All</option>
            {itemTypes.map(type => (
              <option key={type} value={type}>
                Filter by: {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No items found matching your search.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchQuery("");
              setFilterBy("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map((item) => (
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
              <button className="absolute top-4 right-4 text-gray-800 hover:text-red-500 transition-colors">
                <Heart className="w-6 h-6" />
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-2 py-1"
                    onClick={() => updateQuantity(item.id, -1)}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center mx-1 text-black font-medium">
                    {getQuantity(item.id)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-2 py-1"
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
              <Button
                className={`w-full transition-all ${
                  addedItems[item.id]
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-brand-green hover:bg-brand-darkgreen'
                }`}
                onClick={() => handleAddToCart(item)}
              >
                {addedItems[item.id] ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Added!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopPage;
