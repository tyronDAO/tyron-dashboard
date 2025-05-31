export const siteConfig = {
  name: "Tyron Dashboard",
  url: "https://dashboard.tyrondao.org",
  description: "Be Your Own Bank with Tyron",
  baseLinks: {
    home: "/",
    overview: "/overview",
    details: "/details",
    settings: {
      general: "/settings/general",
      billing: "/settings/billing",
      guardians: "/settings/guardians",
      boxes: "/settings/boxes",
    },
  },
}

export type siteConfig = typeof siteConfig
