// FILE: src/features/explore/ExploreScreen.tsx

import AppLayout from "../../app/AppLayout";
import { useGeoNavigation } from "../navigation/useGeoNavigation";
import MapPlaceholder from "./MapPlaceholder";
import { appConfig } from "../../app/config";
import ExploreGeoNavCard from "./ExploreGeoNavCard";
import ExploreMomentsPanel from "./ExploreMomentsPanel";

export default function ExploreScreen() {
  const nav = useGeoNavigation("ch");
  const breadcrumbText = nav.breadcrumb.map((n) => n.name).join(" › ");

  return (
    <AppLayout title="Explore" subtitle="Domain-Test (später Karte/GPS)" backTo="/">
      <div style={{ display: "grid", gap: 12 }}>
        {appConfig.features.geoNavigation && (
          <ExploreGeoNavCard
            breadcrumbText={breadcrumbText}
            current={nav.current}
            children={nav.children}
            canGoBack={nav.canGoBack}
            onBack={() => void nav.goBack()}
            onGoTo={(id) => void nav.goTo(id)}
          />
        )}

        <MapPlaceholder current={nav.current} breadcrumbText={breadcrumbText} />

        {appConfig.features.moments && <ExploreMomentsPanel />}
      </div>
    </AppLayout>
  );
}
