import { CoreValues } from "@/components/about/CoreValues";
import { FounderSpotlight } from "@/components/about/FounderSpotlight";
// import { GetInvolved } from "@/components/about/GetInvolved";
import { OurJourney } from "@/components/about/OurJourney";

export default function Home() {
  return (
    <div className="">
      <FounderSpotlight />
      <CoreValues />
      <OurJourney />
      {/* <GetInvolved /> */}
    </div>
  );
}
