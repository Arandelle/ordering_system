'use client'

import { menuData } from "@/data/menuData";
import { useSubdomainPath } from "@/hooks/useSubdomainUrl";

const ProductMain = () => {

  const menuList = Object.values(menuData)
    .flatMap((items) =>
      items.filter((item) => item.price > 100 && item.description),
    )
    .slice(0, 4);

  const orderUrl = useSubdomainPath("/menu", "food")

  return (
    <section id="products-main-section" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            OUR SIGNATURE PRODUCTS
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our best-selling Filipino BBQ dishes, prepared fresh daily
            with premium ingredients and authentic recipes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuList.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200">
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex text-center">
                  <a
                    href={orderUrl}
                    className="w-full bg-[#e13e00] text-white py-3 font-bold hover:bg-[#b83200] transition-colors"
                  >
                    Order Now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductMain;
