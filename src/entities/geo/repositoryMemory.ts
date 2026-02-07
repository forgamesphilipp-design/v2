import type { GeoRepository, GeoTree } from "./repository";
import type { GeoNode } from "./model";
import type { GeoId, GeoLevel } from "./ids";
import { isCantonId, isDistrictId } from "./ids";
import { loadDistrictsGeo, loadCommunitiesGeo } from "./geoStore";
import { buildDistrictNodesForCanton, buildCommunityNodesForParent } from "./builders";

/**
 * Base tree: Country + Cantons
 * This stays small and static.
 */
const baseNodes: Record<string, GeoNode> = {
  ch: {
    id: "ch",
    level: "country",
    name: "Schweiz",
    parentId: null,
    childrenIds: [
      "1","2","3","4","5","6","7","8","9","10",
      "11","12","13","14","15","16","17","18","19","20",
      "21","22","23","24","25","26"
    ],
  },

  "1":  { id:"1",  level:"canton", name:"Kanton Zürich",                 parentId:"ch", childrenIds:[] },
  "2":  { id:"2",  level:"canton", name:"Kanton Bern",                   parentId:"ch", childrenIds:[] },
  "3":  { id:"3",  level:"canton", name:"Kanton Luzern",                 parentId:"ch", childrenIds:[] },
  "4":  { id:"4",  level:"canton", name:"Kanton Uri",                    parentId:"ch", childrenIds:[] },
  "5":  { id:"5",  level:"canton", name:"Kanton Schwyz",                 parentId:"ch", childrenIds:[] },
  "6":  { id:"6",  level:"canton", name:"Kanton Obwalden",               parentId:"ch", childrenIds:[] },
  "7":  { id:"7",  level:"canton", name:"Kanton Nidwalden",              parentId:"ch", childrenIds:[] },
  "8":  { id:"8",  level:"canton", name:"Kanton Glarus",                 parentId:"ch", childrenIds:[] },
  "9":  { id:"9",  level:"canton", name:"Kanton Zug",                    parentId:"ch", childrenIds:[] },
  "10": { id:"10", level:"canton", name:"Kanton Fribourg",               parentId:"ch", childrenIds:[] },
  "11": { id:"11", level:"canton", name:"Kanton Solothurn",              parentId:"ch", childrenIds:[] },
  "12": { id:"12", level:"canton", name:"Kanton Basel-Stadt",            parentId:"ch", childrenIds:[] },
  "13": { id:"13", level:"canton", name:"Kanton Basel-Landschaft",       parentId:"ch", childrenIds:[] },
  "14": { id:"14", level:"canton", name:"Kanton Schaffhausen",           parentId:"ch", childrenIds:[] },
  "15": { id:"15", level:"canton", name:"Kanton Appenzell Ausserrhoden", parentId:"ch", childrenIds:[] },
  "16": { id:"16", level:"canton", name:"Kanton Appenzell Innerrhoden",  parentId:"ch", childrenIds:[] },
  "17": { id:"17", level:"canton", name:"Kanton St. Gallen",             parentId:"ch", childrenIds:[] },
  "18": { id:"18", level:"canton", name:"Kanton Graubünden",             parentId:"ch", childrenIds:[] },
  "19": { id:"19", level:"canton", name:"Kanton Aargau",                 parentId:"ch", childrenIds:[] },
  "20": { id:"20", level:"canton", name:"Kanton Thurgau",                parentId:"ch", childrenIds:[] },
  "21": { id:"21", level:"canton", name:"Kanton Tessin",                 parentId:"ch", childrenIds:[] },
  "22": { id:"22", level:"canton", name:"Kanton Waadt",                  parentId:"ch", childrenIds:[] },
  "23": { id:"23", level:"canton", name:"Kanton Wallis",                 parentId:"ch", childrenIds:[] },
  "24": { id:"24", level:"canton", name:"Kanton Neuchâtel",              parentId:"ch", childrenIds:[] },
  "25": { id:"25", level:"canton", name:"Kanton Genève",                 parentId:"ch", childrenIds:[] },
  "26": { id:"26", level:"canton", name:"Kanton Jura",                   parentId:"ch", childrenIds:[] },
};

export function createGeoRepositoryMemory(): GeoRepository {
  // mutable in-memory tree (expanded on demand)
  let nodes: Record<string, GeoNode> = { ...baseNodes };

  async function ensureChildren(id: GeoId, level: GeoLevel) {
    const node = nodes[String(id)];
    if (!node) return;

    // already loaded
    if (node.childrenIds.length > 0) return;

    // Canton → Districts (or Communities if no districts exist)
    if (level === "canton" && isCantonId(String(id))) {
      const districtsGeo = await loadDistrictsGeo();
      const { districtNodes, districtIds } =
        buildDistrictNodesForCanton(districtsGeo, String(id));

      if (districtIds.length === 0) {
        // no districts → load communities directly
        const communitiesGeo = await loadCommunitiesGeo();
        const { communityNodes, communityIds } =
          buildCommunityNodesForParent(communitiesGeo, String(id));

        nodes = {
          ...nodes,
          ...communityNodes,
          [String(id)]: { ...node, childrenIds: communityIds },
        };
        return;
      }

      nodes = {
        ...nodes,
        ...districtNodes,
        [String(id)]: { ...node, childrenIds: districtIds },
      };
      return;
    }

    // District → Communities
    if (level === "district" && isDistrictId(String(id))) {
      const communitiesGeo = await loadCommunitiesGeo();
      const { communityNodes, communityIds } =
        buildCommunityNodesForParent(communitiesGeo, String(id));

      nodes = {
        ...nodes,
        ...communityNodes,
        [String(id)]: { ...node, childrenIds: communityIds },
      };
    }
  }

  return {
    async getTree(): Promise<GeoTree> {
      return { rootId: "ch", nodes };
    },

    async getNode(id: GeoId) {
      return nodes[String(id)] ?? null;
    },

    async ensureChildren(id: GeoId, level: GeoLevel) {
      return ensureChildren(id, level);
    },
  };
}
