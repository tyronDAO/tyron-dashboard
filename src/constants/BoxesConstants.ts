export const database_boxes: {
  label: string
  iso: string
  currency: string
  description: string
  isRecommended: boolean
}[] = [
  {
    label: "Syron Dollar",
    iso: "USD",
    currency: "syron-susd",
    description: "Pegged to the US Dollar",
    isRecommended: true,
  },
  {
    label: "Syron Yuan",
    iso: "CNY",
    currency: "syron-yuan",
    description: "Pegged to the Chinese Yuan",
    isRecommended: false,
  },
  {
    label: "Syron Real",
    iso: "BRL",
    currency: "syron-real",
    description: "Pegged to the Brazilian Real",
    isRecommended: false,
  },
  {
    label: "Syron Shekel",
    iso: "ILS",
    currency: "syron-shekel",
    description: "Pegged to the Israeli Shekel",
    isRecommended: false,
  },
]
