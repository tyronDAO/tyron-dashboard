import { basic_bitcoin_syron } from "@/basic_bitcoin_tyron"
import { database_boxes } from "@/constants/BoxesConstants"
import { SafetyDepositBox } from "@/utils/services/safetyDepositBoxService"
import { getApps, initializeApp } from "firebase/app"
import { addDoc, collection, getDocs, getFirestore } from "firebase/firestore"
import { NextRequest, NextResponse } from "next/server"

// Server-side Firebase config (not exposed to client)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase only on server
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)

export interface CreateBoxData {
  walletAddress: string
  currency: string
  addressType: "segwit" | "taproot"
  version?: string
}

class FirebaseService {
  private getCollectionName(currency: string): string {
    const version = process.env.NEXT_PUBLIC_SYRON_VERSION
    let canisterId: string | undefined

    switch (currency) {
      case "syron-susd":
        canisterId = process.env.NEXT_PUBLIC_CANISTER_ID_SYRON_SUSD
        break
      default:
        canisterId = process.env.NEXT_PUBLIC_CANISTER_ID_SYRON_TEST
    }

    if (version === "testnet") {
      switch (currency) {
        case "syron-susd":
          canisterId = process.env.NEXT_PUBLIC_CANISTER_ID_SYRON_SUSD_TESTNET
          break
        default:
          canisterId = process.env.NEXT_PUBLIC_CANISTER_ID_SYRON_TESTNET
      }
    }

    // Ensure we have a valid canister ID
    if (!canisterId) {
      console.error(
        `No canister ID found for currency: ${currency}, version: ${version}`,
      )
      throw new Error(`Invalid canister ID for currency: ${currency}`)
    }

    const collectionName = `${canisterId}-sdb`
    console.log(`Collection name: ${collectionName} for currency: ${currency}`)
    return collectionName
  }

  async getUserBoxes(walletAddress: string): Promise<SafetyDepositBox[]> {
    try {
      const allCurrencies = [
        "syron-susd",
        "syron-yuan",
        "syron-real",
        "syron-shekel",
      ]
      const allBoxes: SafetyDepositBox[] = []

      for (const currency of allCurrencies) {
        const collectionName = this.getCollectionName(currency)

        const querySnapshot = await getDocs(collection(db, collectionName))
        const dataList = querySnapshot.docs.map((doc) => ({
          ...(doc.data() as any),
          docId: doc.id,
        }))
        const data = dataList.find(
          (val) => val?.walletAddress === walletAddress,
        )

        if (data) {
          // Get ISO code from database_boxes
          const currencyInfo = database_boxes.find(
            (db) => db.currency === currency,
          )

          const box: SafetyDepositBox = {
            syronId: data.syronId,
            walletAddress: data.walletAddress,
            boxAddress: data.boxAddress,
            currency: data.currency,
            addressType: data.addressType,
            version: data.version,
            createdAt: new Date(data.createdAt || Date.now()).toISOString(),
            updatedAt: new Date(data.updatedAt || Date.now()).toISOString(),
            iso: currencyInfo?.iso, // Add ISO code
          }
          allBoxes.push(box)
        }
      }

      return allBoxes
    } catch (error) {
      console.error("Error getting user boxes:", error)
      throw error
    }
  }

  async createBox(data: CreateBoxData): Promise<SafetyDepositBox> {
    try {
      console.log("Creating box with data:", data)
      const collectionName = this.getCollectionName(data.currency)
      console.log("Using collection:", collectionName)

      // Check if record already exists
      const existingBoxes = await this.getUserBoxes(data.walletAddress)
      const hasBoxForCombination = existingBoxes.some(
        (box) =>
          box.currency === data.currency &&
          box.addressType === data.addressType &&
          box.version === data.version,
      )

      if (hasBoxForCombination) {
        throw new Error(
          `Box record already exists for ${data.currency} with ${data.addressType} address type`,
        )
      }

      const syron = basic_bitcoin_syron()
      let address = await syron.get_box_address({
        ssi: data.walletAddress,
        op: { getsyron: null },
      })
      if (!address) {
        throw new Error("No box address found")
      }

      // Get ISO code from database_boxes
      const currencyInfo = database_boxes.find(
        (db) => db.currency === data.currency,
      )

      const boxData: SafetyDepositBox = {
        syronId: collectionName,
        walletAddress: data.walletAddress,
        boxAddress: address,
        currency: data.currency,
        addressType: data.addressType,
        version: data.version,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        iso: currencyInfo?.iso, // Add ISO code
      }

      await addDoc(collection(db, collectionName), boxData)

      return boxData
    } catch (error) {
      console.error("Error creating box:", error)
      throw error
    }
  }
}

const firebaseService = new FirebaseService()

// GET /api/safety-deposit-box?walletAddress=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("walletAddress")

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 },
      )
    }

    console.log("GET request for wallet address:", walletAddress)
    const boxes = await firebaseService.getUserBoxes(walletAddress)
    console.log("Found boxes:", boxes.length)
    return NextResponse.json({ boxes })
  } catch (error) {
    console.error("API Error in GET:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch boxes",
      },
      { status: 500 },
    )
  }
}

// POST /api/safety-deposit-box
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, currency, addressType, version } = body

    console.log("POST request body:", body)

    if (!walletAddress || !currency || !addressType || !version) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      )
    }

    const newBox = await firebaseService.createBox({
      walletAddress,
      currency,
      addressType,
      version,
    })

    console.log("Box created successfully:", newBox)
    return NextResponse.json({ box: newBox })
  } catch (error) {
    console.error("API Error in POST:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create box",
      },
      { status: 500 },
    )
  }
}
