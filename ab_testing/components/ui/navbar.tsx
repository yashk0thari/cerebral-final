import React from "react";
import Link from "next/link";
import * as shadcn from "@/components/ui";

const Navbar = () => {
  return (
    <nav className="bg-gray-900 text-gray-100 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          aztest
        </Link>
        <div className="space-x-4">
          <Link href="/" passHref>
            <shadcn.Button variant="link" className="text-gray-100">
              Generate
            </shadcn.Button>
          </Link>
          <Link href="/analytics" passHref>
            <shadcn.Button variant="link" className="text-gray-100">
              Analytics
            </shadcn.Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;