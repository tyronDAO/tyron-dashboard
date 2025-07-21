// Safety Deposit ₿ox service for handling box operations
// This uses secure API routes instead of direct Firebase access

export interface SafetyDepositBox {
  syronId: string
  walletAddress: string
  boxAddress: string
  currency: string
  addressType: "segwit" | "taproot"
  version?: string
  createdAt: string
  updatedAt: string
  iso?: string // ISO code from database_boxes
}

export interface CreateBoxFormData {
  addressType: "segwit" | "taproot"
  currency: string
  timestamp: string
  version: string
}

export interface CreateBoxResult {
  success: boolean
  message: string
  data?: SafetyDepositBox
  error?: string
}

/**
 * Gets user's Safety Deposit ₿oxes from the API
 * @param walletAddress - The user's wallet address
 * @returns Promise<SafetyDepositBox[]> - Array of user's boxes
 */
export async function getUserBoxes(
  walletAddress: string,
): Promise<SafetyDepositBox[]> {
  try {
    const response = await fetch(
      `/api/safety-deposit-box?walletAddress=${encodeURIComponent(walletAddress)}`,
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch boxes: ${response.statusText}`)
    }

    const data = await response.json()
    return data.boxes || []
  } catch (error) {
    console.error("Error fetching user boxes:", error)
    throw error
  }
}

/**
 * Creates a new Safety Deposit ₿ox via API
 * @param formData - The form data for creating the box
 * @param walletAddress - The user's wallet address
 * @param onBoxCreated - Optional callback to refresh workspaces after creation
 * @returns Promise<CreateBoxResult> - The result of the operation
 */
export async function createSafetyDepositBox(
  formData: CreateBoxFormData,
  walletAddress: string,
  onBoxCreated?: () => Promise<void>,
): Promise<CreateBoxResult> {
  try {
    console.log("Creating Safety Deposit ₿ox:", formData)

    // Check if user already has a box for this currency + address type combination
    const existingBoxes = await getUserBoxes(walletAddress)
    const hasBox = existingBoxes.some(
      (box) =>
        box.currency === formData.currency &&
        box.addressType === formData.addressType,
    )

    if (hasBox) {
      return {
        success: false,
        message: `You already have a Safety Deposit ₿ox for ${formData.currency} with ${formData.addressType} address type`,
        error: "Duplicate box",
      }
    }

    // Create the box via API

    const response = await fetch("/api/safety-deposit-box", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        walletAddress,
        currency: formData.currency,
        addressType: formData.addressType,
        version: formData.version,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create box")
    }

    const data = await response.json()
    const newBox = data.box

    console.log("Safety Deposit ₿ox created successfully!", newBox)

    // Refresh workspaces if callback provided
    if (onBoxCreated) {
      await onBoxCreated()
    }

    return {
      success: true,
      message: "Safety Deposit ₿ox created successfully!",
      data: newBox,
    }
  } catch (error) {
    console.error("Error creating Safety Deposit ₿ox:", error)

    return {
      success: false,
      message: "Failed to create Safety Deposit ₿ox",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

/**
 * Validates the form data before submission
 * @param formData - The form data to validate
 * @returns { isValid: boolean, errors: string[] } - Validation result
 */
export function validateBoxFormData(formData: Partial<CreateBoxFormData>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!formData.currency) {
    errors.push("Please select a currency.")
  }

  if (formData.currency !== "syron-susd") {
    errors.push("This currency is not available yet.")
  }

  if (!formData.addressType) {
    errors.push("Please select an address type.")
  }

  if (formData.addressType === "taproot") {
    errors.push("Taproot addresses are not supported yet.")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Handles the form submission for creating a Safety Deposit ₿ox
 * @param formData - The form data
 * @param walletAddress - The user's wallet address
 * @param onSuccess - Callback function called on successful creation
 * @param onError - Callback function called on error
 * @param onBoxCreated - Optional callback to refresh workspaces after creation
 * @returns Promise<void>
 */
export async function handleBoxFormSubmit(
  formData: CreateBoxFormData,
  walletAddress: string,
  onSuccess?: (data: SafetyDepositBox) => void,
  onError?: (error: string) => void,
  onBoxCreated?: () => Promise<void>,
): Promise<void> {
  // Validate form data
  const validation = validateBoxFormData(formData)
  if (!validation.isValid) {
    const errorMessage = validation.errors.join(" ")
    onError?.(errorMessage)
    return
  }

  // Create the box
  const result = await createSafetyDepositBox(
    formData,
    walletAddress,
    onBoxCreated,
  )

  if (result.success) {
    onSuccess?.(result.data!)
  } else {
    onError?.(result.message)
  }
}

/**
 * Formats the form data for submission
 * @param addressType - The address type
 * @param currency - The selected currency
 * @returns CreateBoxFormData - Formatted form data
 */
export function formatBoxFormData(
  addressType: string,
  currency: string,
): CreateBoxFormData {
  const version = process.env.NEXT_PUBLIC_SYRON_VERSION || "1"

  return {
    addressType: addressType as "segwit" | "taproot",
    currency,
    timestamp: new Date().toISOString(),
    version,
  }
}
