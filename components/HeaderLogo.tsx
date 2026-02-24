import Image from "next/image";
import Link from "next/link";
import React from "react";

const HeaderLogo = () => {
  return (
    <Link
      href={"/"}
      className="cursor-pointer flex items-center justify-center"
    >
      <div className="flex items-center">
        <Image
          src="/images/harrison_logo_landscape.png"
          alt="Harrison"
          width={240}
          height={60}
          priority
          quality={92} // tiny bump since smaller size = more perceived sharpness
          className="h-8 w-auto md:h-10 lg:h-12" // 32px → 40px → 48px
          sizes="(max-width: 500px) 120px, (max-width: 1024px) 180px, 240px"
        />
      </div>
    </Link>
  );
};

export default HeaderLogo;
