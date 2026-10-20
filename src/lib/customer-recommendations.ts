import { miloAssignments } from "./milo-assignments";
import { salesWorkers } from "./sales-order";

export const RECOMMENDATION_VERSION="complementary-markets-v1";
const complements: Record<string,string[]>={
 roofing:["architects","builders","general-contractors"],hvac:["general-contractors","builders","property-managers"],
 plumbing:["general-contractors","builders","property-managers"],electrical:["architects","builders","general-contractors"],
 "general-contractors":["architects","builders","property-managers"],architects:["builders","general-contractors"],
 builders:["architects","general-contractors"],landscaping:["property-managers","hoas","hotels"],
 "property-managers":["hoas","builders","general-contractors"],hoas:["property-managers","landscaping"],
 distributors:["building-materials-manufacturers","general-contractors"],"building-materials-manufacturers":["distributors","builders","architects"],
 hotels:["property-managers","restaurants"],restaurants:["hotels"],healthcare:["property-managers"],
 "projects-developments":["architects","builders","general-contractors"]
};
export const workerImages:Record<string,string>={roofing:"Cheerful Robot Roofer at Work.png",hvac:"Friendly Robot HVAC Technician at Work.png",plumbing:"Robot Technician Servicing a Water Heater.png",electrical:"Friendly Robot Electrician at Work.png","general-contractors":"Robot Supervises a Sunny Construction Site.png",architects:"Robot Architect at Blueprint Desk.png",builders:"Robot Reviews New Home Blueprints.png",landscaping:"Milo Trims the Sunny Garden.png","property-managers":"Cheerful Robot Property Inspector at Modern Apartments.png",hoas:"Friendly HOA Robot at the Community Board.png",distributors:"Friendly Robot Warehouse Inspector.png",hotels:"Friendly Robot Concierge at a Tropical Resort.png",restaurants:"Milo Welcomes Guests to the Bistro.png",healthcare:"Friendly Robot Welcomes Healthcare Visitors.png","building-materials-manufacturers":"Friendly Robot Factory Inspector.png"};
export function assignmentLabel(agentId:string){return salesWorkers.find(w=>w.id===agentId)?.customerType ?? (agentId==="projects-developments"?"Projects & Developments":agentId);}
export function recommendAssignments(ownedSlugs:string[],limit=6){
 const owned=new Set(ownedSlugs),sources=miloAssignments.filter(a=>owned.has(a.slug));
 if(!sources.length)return [];
 return miloAssignments.filter(a=>a.available&&!owned.has(a.slug)).map(a=>{
  let score=0,reason="";
  for(const source of sources){
   const sameMarket=a.regionId===source.regionId||a.regionId==="united-states";
   if(complements[source.agentId]?.includes(a.agentId)&&sameMarket){const value=100-complements[source.agentId].indexOf(a.agentId);if(value>score){score=value;reason=`Complement your ${assignmentLabel(source.agentId)} discovery in ${source.region}.`;}}
   if(a.agentId===source.agentId&&a.regionId!==source.regionId&&score<60){score=60;reason=`Extend your ${assignmentLabel(a.agentId)} discovery into ${a.region}.`;}
  }
  return {...a,score,reason,label:assignmentLabel(a.agentId),image:`/images/agents/${workerImages[a.agentId]??workerImages.roofing}`};
 }).filter(a=>a.score>0).sort((a,b)=>b.score-a.score||a.slug.localeCompare(b.slug)).slice(0,limit);
}
