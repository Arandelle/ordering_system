import React from "react";

const MainIntro = () => {
  return (
    <div className="max-w-5xl mx-auto text-center mt-24 px-4 space-y-6">
      {/* Headline */}
      <h1 className="text-4xl md:text-5xl font-bold leading-tight">
        Welcome to{" "}
        <span className="text-brand-color-500">
          Harrison’s House of Inasal & BBQ
        </span>
      </h1>

      {/* Subheadline */}
      <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
        We serve your favorite Filipino grilled dishes—flavorful, freshly
        prepared, and made to be enjoyed with the people who matter most. From
        our signature inasal to classic BBQ favorites, every meal is grilled
        right and served with heart.
      </p>

      {/* Supporting Message */}
      <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
        Whether you’re dining in, taking out, or ordering online, Harrison’s
        makes it easy to enjoy bold, satisfying flavors anytime.
      </p>

      {/* Tagline Section */}
      <div className="pt-4 space-y-2">
        <blockquote>
            <p className="text-brand-color-500 font-semibold italic text-xl md:text-2xl font-serif">
              "Where Real Grilled Sarap Feels Like Home"
            </p>
        </blockquote>
        <p className="text-base md:text-lg text-gray-700">
          Juicy inasal. Smoky BBQ. Fresh off the grill—every single day.
        </p>
      </div>

      <div className="space-x-4">
        <button className="py-2 px-4 bg-brand-color-500 hover:bg-brand-color-600 cursor-pointer text-white font-bold rounded-lg">
          Order Now
        </button>
        <button className="py-2 px-4 bg-brand-color-500 hover:bg-brand-color-600 cursor-pointer text-white font-bold rounded-lg">
          View Menu
        </button>
        <button className="py-2 px-4 bg-brand-color-500 hover:bg-brand-color-600 cursor-pointer text-white font-bold rounded-lg">
          Find a branch
        </button>
      </div>
    </div>
  );
};

export default MainIntro;
