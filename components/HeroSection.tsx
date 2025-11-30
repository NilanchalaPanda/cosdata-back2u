import { ArrowRight, Search, Sparkles, Upload } from "lucide-react";
import Link from "next/link";

interface HeroSectionProps {
  onReportClick: () => void;
  onSearchClick: () => void;
}

const HeroSection = ({ onReportClick, onSearchClick }: HeroSectionProps) => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6 mx-auto text-center max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium  mb-6">
          <Sparkles className="h-4 w-4" />
          AI-Powered Lost & Found
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
          Lost Something?
          <br />
          <span className="text-primary">We&apos;ll Help You Find It</span>
        </h1>

        <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto">
          An intelligent platform for colleges, malls, and offices. Report found
          items or search for lost belongings using AI-powered matching.
        </p>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto">
          <button
            onClick={onReportClick}
            className="group flex flex-col items-center justify-center p-8 rounded-2xl border border-[#7BAF97]/50 bg-white transition shadow-sm hover:border-[#7BAF97] hover:shadow-md hover:bg-[#EEF7F3] hover:cursor-pointer hover:scale-[1.02]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#E5F2EB] text-[#7BAF97] transition group-hover:bg-[#D7EBE2]">
              <Upload className="h-7 w-7" />
            </div>

            <h3 className="mt-3 text-lg font-semibold text-[#1A1C1A]">
              Found Something?
            </h3>

            <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#4A9F7A] group-hover:text-[#3D8B69]">
              Report Item
              <ArrowRight
                width={15}
                className="transition group-hover:translate-x-1"
              />
            </span>
          </button>

          <button
            onClick={onSearchClick}
            className="group flex flex-col items-center justify-center rounded-2xl border-2 border-primary/40 bg-white transition hover:border-primary hover:shadow-lg hover:bg-primary/10 hover:cursor-pointer hover:scale-[1.02] p-8"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl text-primary bg-primary/10 transition group-hover:bg-primary/20">
              <Search className="h-7 w-7" />
            </div>
            <div>
              <h3 className="mt-3 text-lg font-bold text-foreground mb-1">
                Lost Something?
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:text-primary/80">
              Search Now
              <ArrowRight
                width={15}
                className="transition group-hover:translate-x-1"
              />
            </span>
          </button>
        </div>

        <Link
          href="/items"
          className="mt-10 inline-flex items-center gap-1 text-sm font-medium text-foreground/70 hover:underline"
        >
          <p>View All Items</p>
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
