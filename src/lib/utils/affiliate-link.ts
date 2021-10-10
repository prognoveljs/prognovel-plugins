export function generateAffiliateLink(address: string, id: string): string {
  const thisPage = new URL(window.location.href);
  thisPage.search = "";
  thisPage.searchParams.set("affiliate", encodeURI(address));
  thisPage.searchParams.set("affiliateId", encodeURI(id));
  return thisPage.href;
}
