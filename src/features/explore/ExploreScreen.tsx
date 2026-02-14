// FILE: src/features/explore/ExploreScreen.tsx

import AppLayout from "../../app/AppLayout";
import { useGeoNavigation } from "../navigation/useGeoNavigation";
import Map from "./Map";
import { appConfig } from "../../app/config";
import ExploreGeoNavCard from "./ExploreGeoNavCard";
import ExploreMomentsPanel from "./ExploreMomentsPanel";

export default function ExploreScreen() {
  const nav = useGeoNavigation("ch");

  return (
    <AppLayout title="Explore" subtitle="Erkunde die Schweiz." backTo="/">
      <div style={{ display: "grid", gap: 12 }}>
        {appConfig.features.geoNavigation && (
          <ExploreGeoNavCard
            breadcrumb={nav.breadcrumb}
            current={nav.current}
            canGoBack={nav.canGoBack}
            onBack={() => void nav.goBack()}
            onGoTo={(id) => void nav.goTo(id)}
          />
        )}

        <Map
          current={nav.current}
          onSelectNode={(id) => void nav.goTo(id as any)}
        />

        {appConfig.features.moments && <ExploreMomentsPanel />}
      </div>
    </AppLayout>
  );
}
