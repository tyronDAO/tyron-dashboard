import { siteConfig } from "@/app/siteConfig"
import {
  RiHome2Line,
  RiLinkM,
  RiListCheck,
  RiSettings5Line,
  RiShieldUserFill,
} from "@remixicon/react"

export const navigation = [
  {
    name: "Overview",
    href: siteConfig.baseLinks.overview,
    icon: RiHome2Line,
  },
  {
    name: "Account",
    href: siteConfig.baseLinks.account.box,
    icon: RiShieldUserFill,
  },
  { name: "Details", href: siteConfig.baseLinks.details, icon: RiListCheck },
  {
    name: "Settings",
    href: siteConfig.baseLinks.settings.boxes,
    icon: RiSettings5Line,
  },
] as const

export const shortcuts = [
  {
    name: "Add New ₿ox",
    href: "/settings/boxes",
    icon: RiLinkM,
  },
  {
    name: "Deposit Bitcoin",
    href: "/account/deposit/bitcoin",
    icon: RiLinkM,
  },
  {
    name: "Add New Guardian",
    href: "/settings/guardians",
    icon: RiLinkM,
  },
  {
    name: "Workspace usage",
    href: "/settings/billing#billing-overview",
    icon: RiLinkM,
  },
  {
    name: "Cost spend control",
    href: "/settings/billing#cost-spend-control",
    icon: RiLinkM,
  },
  {
    name: "Overview – Rows written",
    href: "/overview#usage-overview",
    icon: RiLinkM,
  },
] as const
