import { MapPin, Search } from "lucide-react";
import Link from "next/link";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="bg-red-500 flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-foreground">FindIt</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            How it Works
          </a>
          <a
            href="#recent"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Recent Items
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {/* <ThemeToggle /> */}
          <button className="hidden sm:flex">
            <Search className="h-4 w-4 mr-2" />
            Search
          </button>
          <button>Report Found</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
