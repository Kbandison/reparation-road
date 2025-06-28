import { CoreValues } from "@/components/about/CoreValues";
import { FounderSpotlight } from "@/components/about/FounderSpotlight";
import { OurJourney } from "@/components/about/OurJourney";

export default function Home() {
  return (
    <div className="">
      <FounderSpotlight />
      <CoreValues />
      <OurJourney />
    </div>
  );
}
