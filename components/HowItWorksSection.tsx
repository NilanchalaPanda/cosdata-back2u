import { Upload, Search, Sparkles, HandshakeIcon } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Report or Search",
    description:
      "Found something? Report it with a photo. Lost something? Describe it or upload a reference image.",
    bg: "bg-orange-100",
    text: "text-primary",
  },
  {
    icon: Sparkles,
    title: "AI Does the Work",
    description:
      "Our AI converts descriptions and images into smart vectors, enabling accurate semantic matching.",
    bg: "bg-orange-100",
    text: "text-primary",
  },
  {
    icon: Search,
    title: "Find Matches",
    description:
      "Get instant results ranked by similarity. See where items are held and who to contact.",
    bg: "bg-orange-100",
    text: "text-primary",
  },
  {
    icon: HandshakeIcon,
    title: "Safe Recovery",
    description:
      "Verify ownership at the designated location. No direct contact until physical verification.",
    bg: "bg-orange-100",
    text: "text-primary",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-20 bg-background">
      <div className="container max-w-5xl mx-auto px-4 md:px-6">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-5xl font-bold text-gray-900 mb-3">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-xl font-medium">
            Simple, fast, and powered by smart matching to help you recover lost
            items
          </p>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center py-6 px-10 rounded-2xl bg-white border border-gray-200 shadow hover:shadow-xl transition"
              >
                {/* Icon */}
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl ${step.bg} ${step.text} mb-4`}
                >
                  <Icon className="h-7 w-7" />
                </div>

                {/* Content */}
                <h3 className="font-semibold text-gray-900 mb-2 text-lg md:text-xl">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 font-medium">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
