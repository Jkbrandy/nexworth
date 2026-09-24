"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import {
  MapPin,
  Map as MapIcon,
  LayoutList,
  Search,
  Store,
  Receipt,
  ExternalLink,
  Utensils,
  ShoppingCart,
  ShoppingBag,
  Shirt,
  Sparkles,
  HeartPulse,
  Dumbbell,
  Clapperboard,
  Plane,
  Cpu,
  Car,
  GraduationCap,
  Sofa,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CardGridSkeleton } from "@/components/ui/loading-states";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useSession } from "@/hooks/use-session";
import { apiFetch, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { MERCHANT_CATEGORIES } from "@/lib/merchant-categories";
import { CITY_COORDINATES, MARKET_DEFAULT_VIEW, merchantLatLng } from "@/lib/city-coordinates";
import type { MapMerchant } from "@/components/find-merchants/merchants-map";

const MerchantsMap = dynamic(() => import("@/components/find-merchants/merchants-map").then((m) => m.MerchantsMap), {
  ssr: false,
  loading: () => <Skeleton className="h-140 w-full rounded-xl" />,
});

const selectClassName =
  "border-input flex h-10 cursor-pointer rounded-lg border bg-transparent px-3.5 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface MerchantLocation {
  label: string;
  address?: string;
  city?: string;
  country: string;
  mapsUrl?: string;
  coordinates?: { coordinates: [number, number] };
}

interface PublicOffer {
  id: string;
  title: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  terms?: string;
  isOnline: boolean;
  validTo?: string;
}

interface PublicMerchant {
  id: string;
  name: string;
  category: string;
  description?: string;
  logoUrl?: string;
  country: "GH" | "UK";
  discountPercent?: number;
  locations: MerchantLocation[];
  /** Live offers only (active, within their valid window) — sorted best-value-first by the API. Empty for merchants still on the legacy flat discountPercent. */
  offers: PublicOffer[];
  redemptionCount: number;
}

/** "20% off" / "$15 off" — the discount summary shown on a card badge or in the detail sheet's offer list. Matches the $/% icon convention already used for offer.discountType in the merchant portal's own discounts table. */
function formatDiscount(offer: Pick<PublicOffer, "discountType" | "discountValue">) {
  return offer.discountType === "percentage" ? `${offer.discountValue}% off` : `$${offer.discountValue} off`;
}

const categoryIcons: Record<string, LucideIcon> = {
  "Restaurant": Utensils,
  "Grocery & Supermarket": ShoppingCart,
  "Retail & Shopping": ShoppingBag,
  "Fashion & Apparel": Shirt,
  "Beauty & Spa": Sparkles,
  "Health & Wellness": HeartPulse,
  "Fitness & Gym": Dumbbell,
  "Entertainment & Leisure": Clapperboard,
  "Travel & Hospitality": Plane,
  "Electronics & Tech": Cpu,
  "Automotive": Car,
  "Education": GraduationCap,
  "Home & Furniture": Sofa,
};

const marketLabel: Record<"GH" | "UK", string> = { GH: "Ghana", UK: "United Kingdom" };

function MerchantCard({ merchant, onSelect }: { merchant: PublicMerchant; onSelect: (merchant: PublicMerchant) => void }) {
  const Icon = categoryIcons[merchant.category] ?? Store;
  const location = merchant.locations[0];
  const primaryOffer = merchant.offers[0];
  const extraOfferCount = merchant.offers.length - 1;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onSelect(merchant)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(merchant);
        }
      }}
      className="cursor-pointer overflow-hidden transition-colors hover:border-primary/40"
    >
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex flex-col items-end gap-1">
            {primaryOffer ? (
              <Badge className="border-success/20 bg-success/15 text-sm font-semibold text-success">
                {formatDiscount(primaryOffer)}
              </Badge>
            ) : (
              merchant.discountPercent !== undefined && (
                <Badge className="border-success/20 bg-success/15 text-sm font-semibold text-success">
                  {merchant.discountPercent}% off
                </Badge>
              )
            )}
            {extraOfferCount > 0 && (
              <span className="text-xs font-medium text-muted-foreground">
                +{extraOfferCount} more {extraOfferCount === 1 ? "offer" : "offers"}
              </span>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold">{merchant.name}</h3>
          {merchant.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{merchant.description}</p>}
          <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <Receipt className="h-3 w-3 shrink-0" />
            {merchant.redemptionCount} {merchant.redemptionCount === 1 ? "redemption" : "redemptions"}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t pt-3 text-sm">
          <Badge variant="outline">{merchant.category}</Badge>
          {location ? (
            location.mapsUrl ? (
              <a
                href={location.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-muted-foreground hover:text-primary hover:underline"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {location.city ?? marketLabel[merchant.country]}
              </a>
            ) : (
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {location.city ?? marketLabel[merchant.country]}
              </span>
            )
          ) : (
            <span className="text-muted-foreground">{marketLabel[merchant.country]}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MerchantDetailSheet({
  merchant,
  onOpenChange,
}: {
  merchant: PublicMerchant | null;
  onOpenChange: (open: boolean) => void;
}) {
  const Icon = merchant ? (categoryIcons[merchant.category] ?? Store) : Store;
  const location = merchant?.locations[0];
  const preciseCoords = location ? merchantLatLng(location) : null;
  const cityCoords = location?.city ? CITY_COORDINATES[location.city] : undefined;
  const mapCenter = merchant ? (preciseCoords ?? cityCoords ?? MARKET_DEFAULT_VIEW[merchant.country]) : undefined;
  const mapZoom = preciseCoords ? 15 : cityCoords ? 12 : 4;

  const detailMapMerchants: MapMerchant[] = useMemo(() => {
    if (!merchant || !location) return [];
    return [
      {
        id: merchant.id,
        name: merchant.name,
        category: merchant.category,
        discountPercent: merchant.discountPercent,
        city: location.city ?? "",
        country: merchant.country,
        coords: preciseCoords ?? undefined,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchant?.id, location?.city]);

  return (
    <Sheet open={Boolean(merchant)} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        {merchant && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <SheetTitle>{merchant.name}</SheetTitle>
                  <SheetDescription className="sr-only">{merchant.name} details</SheetDescription>
                  <Badge variant="outline" className="mt-1">
                    {merchant.category}
                  </Badge>
                </div>
              </div>
            </SheetHeader>

            <div className="space-y-6 px-4">
              {merchant.description && <p className="text-sm text-muted-foreground">{merchant.description}</p>}

              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Receipt className="h-4 w-4 shrink-0" />
                {merchant.redemptionCount} {merchant.redemptionCount === 1 ? "redemption" : "redemptions"} so far
              </p>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Discounts</h4>
                {merchant.offers.length > 0 ? (
                  <div className="space-y-2">
                    {merchant.offers.map((offer) => (
                      <div key={offer.id} className="rounded-lg border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium">{offer.title}</p>
                          <Badge className="shrink-0 border-success/20 bg-success/15 text-xs font-semibold text-success">
                            {formatDiscount(offer)}
                          </Badge>
                        </div>
                        {offer.terms && <p className="mt-1 text-xs text-muted-foreground">{offer.terms}</p>}
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {offer.isOnline && <span>Online only</span>}
                          {offer.validTo && <span>Valid until {formatDate(offer.validTo)}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : merchant.discountPercent !== undefined ? (
                  <div className="rounded-lg border p-3">
                    <p className="text-sm font-medium">{merchant.discountPercent}% off</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No active discount codes right now — check back soon.</p>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Location</h4>
                {location ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {[location.address, location.city].filter(Boolean).join(", ") || marketLabel[merchant.country]}
                    </p>
                    {mapCenter && (
                      <div className="h-80 overflow-hidden rounded-xl">
                        <MerchantsMap merchants={detailMapMerchants} defaultCenter={mapCenter} defaultZoom={mapZoom} lockToDefaultView />
                      </div>
                    )}
                    {location.mapsUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5"
                        render={<a href={location.mapsUrl} target="_blank" rel="noopener noreferrer" />}
                        nativeButton={false}
                      >
                        Open in Google Maps
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{marketLabel[merchant.country]}</p>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function EmptyState({ hasAnyMerchants }: { hasAnyMerchants: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Store className="h-6 w-6" />
      </div>
      <p className="max-w-sm text-sm text-muted-foreground">
        {hasAnyMerchants ? "No merchants match these filters." : "No participating merchants yet — check back soon."}
      </p>
    </div>
  );
}

export default function FindMerchantsPage() {
  const { user } = useSession();
  const [merchants, setMerchants] = useState<PublicMerchant[] | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [marketFilter, setMarketFilter] = useState<"all" | "GH" | "UK">("all");
  const [view, setView] = useState<"list" | "map">("list");
  const [selectedMerchant, setSelectedMerchant] = useState<PublicMerchant | null>(null);

  useEffect(() => {
    apiFetch<{ merchants: PublicMerchant[] }>("/merchants")
      .then((data) => setMerchants(data.merchants))
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Couldn't load merchants."));
  }, []);

  useEffect(() => {
    if (user?.country) setMarketFilter(user.country);
  }, [user?.country]);

  const filteredMerchants = useMemo(() => {
    if (!merchants) return null;
    const query = search.trim().toLowerCase();
    return merchants.filter((merchant) => {
      if (categoryFilter !== "all" && merchant.category !== categoryFilter) return false;
      if (marketFilter !== "all" && merchant.country !== marketFilter) return false;
      if (query && !merchant.name.toLowerCase().includes(query) && !merchant.category.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [merchants, search, categoryFilter, marketFilter]);

  const mapMerchants: MapMerchant[] = useMemo(
    () =>
      (filteredMerchants ?? [])
        .filter((merchant) => merchant.locations[0]?.city)
        .map((merchant) => ({
          id: merchant.id,
          name: merchant.name,
          category: merchant.category,
          discountPercent: merchant.discountPercent,
          city: merchant.locations[0]!.city!,
          country: merchant.country,
          coords: merchantLatLng(merchant.locations[0]!) ?? undefined,
        })),
    [filteredMerchants],
  );

  return (
    <div className="mx-auto flex max-w-8xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Find Merchants</h1>
        <p className="mt-1 text-sm text-muted-foreground">Discover participating merchants near you, with your available discount.</p>
      </div>

      <div className="sticky top-0 z-10 -mx-8 flex flex-wrap items-center gap-3 bg-background px-8 py-3 shadow-sm">
        <div className="relative min-w-50 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or category"
            className="bg-background pl-10"
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={cn(selectClassName, "bg-background")}>
          <option value="all">All categories</option>
          {MERCHANT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          value={marketFilter}
          onChange={(e) => setMarketFilter(e.target.value as typeof marketFilter)}
          className={cn(selectClassName, "bg-background")}
        >
          <option value="all">All markets</option>
          <option value="GH">Ghana</option>
          <option value="UK">United Kingdom</option>
        </select>
        <Tabs value={view} onValueChange={(v) => setView(v as "list" | "map")}>
          <TabsList>
            <TabsTrigger value="list" className="gap-1.5">
              <LayoutList className="h-4 w-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-1.5">
              <MapIcon className="h-4 w-4" />
              Map
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {!filteredMerchants ? (
        view === "map" ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <Skeleton className="h-140 w-full rounded-xl lg:sticky lg:top-20 lg:h-[calc(100vh-9rem)]" />
            <CardGridSkeleton count={4} className="sm:grid-cols-2 lg:grid-cols-2" />
          </div>
        ) : (
          <CardGridSkeleton count={6} />
        )
      ) : view === "map" ? (
        <div className={cn("grid gap-5", filteredMerchants.length > 0 && "lg:grid-cols-2")}>
          <div className="h-140 lg:sticky lg:top-20 lg:h-[calc(100vh-9rem)]">
            <MerchantsMap
              merchants={mapMerchants}
              defaultCenter={user?.country ? MARKET_DEFAULT_VIEW[user.country] : undefined}
              defaultZoom={user?.country ? 13 : undefined}
              lockToDefaultView={Boolean(user?.country)}
            />
          </div>
          {filteredMerchants.length === 0 ? (
            <EmptyState hasAnyMerchants={Boolean(merchants?.length)} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {filteredMerchants.map((merchant) => (
                <MerchantCard key={merchant.id} merchant={merchant} onSelect={setSelectedMerchant} />
              ))}
            </div>
          )}
        </div>
      ) : filteredMerchants.length === 0 ? (
        <EmptyState hasAnyMerchants={Boolean(merchants?.length)} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMerchants.map((merchant) => (
            <MerchantCard key={merchant.id} merchant={merchant} onSelect={setSelectedMerchant} />
          ))}
        </div>
      )}

      <MerchantDetailSheet merchant={selectedMerchant} onOpenChange={(open) => !open && setSelectedMerchant(null)} />
    </div>
  );
}
