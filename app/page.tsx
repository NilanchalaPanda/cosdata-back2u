"use client";

import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ReportFoundForm from "@/components/ReportFoundForm";
import SearchLostForm from "@/components/SearchLostForm";
import UserReview from "@/components/UserReview";
import { useState } from "react";

export default function Home() {
  const [showReportForm, setShowReportForm] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(false);

  return (
    <div className="bg-background">
      <main>
        <HeroSection
          onReportClick={() => setShowReportForm(true)}
          onSearchClick={() => setShowSearchForm(true)}
        />
        <HowItWorksSection />
        {/* <RecentItemsSection /> */}
      </main>

      <UserReview />

      <Footer />

      {/* Modals */}
      {showReportForm && (
        <ReportFoundForm onClose={() => setShowReportForm(false)} />
      )}
      {showSearchForm && (
        <SearchLostForm onClose={() => setShowSearchForm(false)} />
      )}
    </div>
  );
}
