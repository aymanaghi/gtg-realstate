import { BASE_PATH } from "@/lib/format";
import type { Lead, Listing } from "./types";

/**
 * Demo content used until Supabase is connected. Replace with GTG's real
 * listings through the CRM; nothing here is a real, permitted listing.
 */
const agent = {
  name: "GTG Advisory Team",
  brn: null,
  phone: "+971566527700",
  languages: ["English", "العربية", "Русский"],
};

const desc = (en: string, ar: string, ru: string) => ({ en, ar, ru });

/**
 * Placeholder photos from Unsplash (free to use under the Unsplash licence),
 * stored in public/photos by the "Fetch listing photos" workflow.
 * Swap for GTG's own photos of each unit before going live.
 */
const photo = (id: string, alt: string) => ({
  url: `${BASE_PATH}/photos/${id}.jpg`,
  alt,
});

export const sampleListings: Listing[] = [
  {
    id: "sample-1",
    slug: "dubai-marina-2-bed-marina-view",
    ref: "GTG-S-1001",
    purpose: "sale",
    market: "ready",
    type: "apartment",
    title: desc("2-bed apartment with full marina view", "شقة غرفتين بإطلالة كاملة على المارينا", "Апартаменты с 2 спальнями и видом на марину"),
    description: desc(
      "[Sample listing — replace with the agent’s description.]",
      "[إعلان تجريبي — استبدله بوصف الوكيل.]",
      "[Демо-объект — замените описанием агента.]",
    ),
    community: desc("Dubai Marina", "دبي مارينا", "Дубай Марина"),
    building: null,
    emirate: "Dubai",
    priceAed: 2450000,
    beds: 2,
    baths: 2,
    sizeSqft: 1320,
    permitNo: "[permit]",
    permitExpiry: "2099-12-31",
    featured: true,
    images: [
      photo("photo-1611577810610-642f8ac05c32", "Dubai Marina towers from the water"),
      photo("photo-1757924461488-ef9ad0670978", "Living room with large windows"),
      photo("photo-1663811397207-418a92396ad5", "Living area with feature wall"),
    ],
    agent,
  },
  {
    id: "sample-2",
    slug: "arabian-ranches-3-bed-townhouse",
    ref: "GTG-S-1002",
    purpose: "rent",
    market: "ready",
    type: "townhouse",
    title: desc("3-bed townhouse with private garden", "تاون هاوس 3 غرف مع حديقة خاصة", "Таунхаус с 3 спальнями и садом"),
    description: desc("[Sample listing.]", "[إعلان تجريبي.]", "[Демо-объект.]"),
    community: desc("Arabian Ranches", "المرابع العربية", "Арабиан Ранчес"),
    building: null,
    emirate: "Dubai",
    priceAed: 145000,
    beds: 3,
    baths: 4,
    sizeSqft: 2410,
    permitNo: "[permit]",
    permitExpiry: "2099-12-31",
    featured: true,
    images: [
      photo("photo-1582610116397-edb318620f90", "Pool and garden"),
      photo("photo-1680416124510-5eae1beca412", "Open-plan living room and kitchen"),
      photo("photo-1715985160053-d339e8b6eb94", "Kitchen"),
    ],
    agent,
  },
  {
    id: "sample-3",
    slug: "jvc-1-bed-off-plan",
    ref: "GTG-S-1003",
    purpose: "sale",
    market: "off_plan",
    type: "apartment",
    title: desc("1-bed apartment in a new launch", "شقة غرفة واحدة في مشروع جديد", "Апартаменты с 1 спальней в новом проекте"),
    description: desc("[Sample listing.]", "[إعلان تجريبي.]", "[Демо-объект.]"),
    community: desc("Jumeirah Village Circle", "قرية جميرا الدائرية", "Джумейра Вилладж Серкл"),
    building: null,
    emirate: "Dubai",
    priceAed: 980000,
    beds: 1,
    baths: 1,
    sizeSqft: 760,
    permitNo: "[permit]",
    permitExpiry: "2099-12-31",
    featured: true,
    images: [
      photo("photo-1615747476328-41153cf6da54", "Terrace with Dubai skyline view"),
      photo("photo-1713832139688-79676097edde", "Living room with a large window"),
      photo("photo-1638454668466-e8dbd5462f20", "Bedroom with desk"),
    ],
    agent,
  },
  {
    id: "sample-4",
    slug: "business-bay-office-canal-view",
    ref: "GTG-S-1004",
    purpose: "sale",
    market: "ready",
    type: "office",
    title: desc("Office floor with canal view", "طابق مكاتب بإطلالة على القناة", "Офисный этаж с видом на канал"),
    description: desc("[Sample listing.]", "[إعلان تجريبي.]", "[Демо-объект.]"),
    community: desc("Business Bay", "الخليج التجاري", "Бизнес Бэй"),
    building: null,
    emirate: "Dubai",
    priceAed: 6900000,
    beds: null,
    baths: 2,
    sizeSqft: 4100,
    permitNo: "[permit]",
    permitExpiry: "2099-12-31",
    featured: true,
    images: [
      photo("photo-1706074793638-da28b90ea8ae", "Open-plan office"),
      photo("photo-1497366216548-37526070297c", "Office corridor"),
      photo("photo-1706074740295-d7a79c079562", "Glass-walled meeting room"),
    ],
    agent,
  },
  {
    id: "sample-5",
    slug: "dubai-hills-4-bed-villa-pool",
    ref: "GTG-S-1005",
    purpose: "sale",
    market: "ready",
    type: "villa",
    title: desc("4-bed villa with private pool", "فيلا 4 غرف مع مسبح خاص", "Вилла с 4 спальнями и бассейном"),
    description: desc("[Sample listing.]", "[إعلان تجريبي.]", "[Демо-объект.]"),
    community: desc("Dubai Hills Estate", "دبي هيلز استيت", "Дубай Хиллс Истейт"),
    building: null,
    emirate: "Dubai",
    priceAed: 8500000,
    beds: 4,
    baths: 5,
    sizeSqft: 4800,
    permitNo: "[permit]",
    permitExpiry: "2099-12-31",
    featured: false,
    images: [
      photo("photo-1613977257365-aaae5a9817ff", "Villa with private pool"),
      photo("photo-1758448755952-42b404bc6f39", "Formal living room"),
      photo("photo-1512914890251-2f96a9b0bbe2", "Kitchen with island"),
    ],
    agent,
  },
  {
    id: "sample-6",
    slug: "palm-jumeirah-penthouse-sea-view",
    ref: "GTG-S-1006",
    purpose: "sale",
    market: "ready",
    type: "penthouse",
    title: desc("Penthouse with infinity pool and sea view", "بنتهاوس بمسبح لا متناهٍ وإطلالة بحرية", "Пентхаус с панорамным бассейном и видом на море"),
    description: desc("[Sample listing.]", "[إعلان تجريبي.]", "[Демо-объект.]"),
    community: desc("Palm Jumeirah", "نخلة جميرا", "Пальм Джумейра"),
    building: null,
    emirate: "Dubai",
    priceAed: 18500000,
    beds: 4,
    baths: 5,
    sizeSqft: 6200,
    permitNo: "[permit]",
    permitExpiry: "2099-12-31",
    featured: false,
    images: [
      photo("photo-1543489822-c49534f3271f", "Infinity pool overlooking the sea"),
      photo("photo-1628592102751-ba83b0314276", "Modern living room"),
      photo("photo-1697947656193-a87d460b5fb5", "Living room with a large window"),
    ],
    agent,
  },
];

/** Sample timestamps are minutes before "now"; getLeads resolves them per request. */
const ago = (minutes: number) => `-${minutes}`;

export const sampleLeads: Lead[] = [
  { id: "l1", name: "[Lead name]", phone: "+9715…", source: "whatsapp", stage: "new", interest: "Buy · 2 bed · Dubai Marina", budget: "Up to AED 2.5M", language: "RU", agentName: null, createdAt: ago(18), lastContactAt: null },
  { id: "l2", name: "[Lead name]", phone: "+9715…", source: "property_finder", stage: "new", interest: "Rent · Villa · Arabian Ranches", budget: "AED 150k / yr", language: "EN", agentName: null, createdAt: ago(22), lastContactAt: null },
  { id: "l3", name: "[Lead name]", phone: "+9715…", source: "website", stage: "new", interest: "Golden Visa · Investment", budget: "AED 2M+", language: "AR", agentName: "[Agent]", createdAt: ago(4), lastContactAt: null },
  { id: "l4", name: "[Lead name]", phone: "+9715…", source: "bayut", stage: "contacted", interest: "Buy · Off-plan · Business Bay", budget: "AED 1–1.5M", language: "EN", agentName: "[Agent]", createdAt: ago(600), lastContactAt: ago(120) },
  { id: "l5", name: "[Lead name]", phone: "+9715…", source: "meta_ads", stage: "contacted", interest: "Buy · 3 bed · Dubai Hills", budget: "AED 4–5M", language: "RU", agentName: "[Agent]", createdAt: ago(1800), lastContactAt: ago(1400) },
  { id: "l6", name: "[Lead name]", phone: "+9715…", source: "website", stage: "qualified", interest: "Commercial · Office · Business Bay", budget: "AED 6–8M", language: "EN", agentName: "[Agent]", createdAt: ago(4000), lastContactAt: ago(300) },
  { id: "l7", name: "[Lead name]", phone: "+9715…", source: "property_finder", stage: "viewing", interest: "Rent · 2 bed · Marina", budget: "AED 120k / yr", language: "AR", agentName: "[Agent]", createdAt: ago(5000), lastContactAt: ago(900) },
  { id: "l8", name: "[Lead name]", phone: "+9715…", source: "whatsapp", stage: "viewing", interest: "Buy · Villa · Palm Jumeirah", budget: "AED 15M+", language: "RU", agentName: "[Agent]", createdAt: ago(7000), lastContactAt: ago(1000) },
  { id: "l9", name: "[Lead name]", phone: "+9715…", source: "bayut", stage: "offer", interest: "Buy · 2 bed · Dubai Marina", budget: "Offer AED 2.38M", language: "EN", agentName: "[Agent]", createdAt: ago(9000), lastContactAt: ago(200) },
  { id: "l10", name: "[Lead name]", phone: "+9715…", source: "website", stage: "closed_won", interest: "Rent · Townhouse · Ranches", budget: "AED 145k / yr", language: "EN", agentName: "[Agent]", createdAt: ago(20000), lastContactAt: ago(3000) },
];
