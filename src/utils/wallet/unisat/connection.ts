// Unisat network types
enum UnisatNetworkType {
  mainnet = "BITCOIN_MAINNET",
  testnet4 = "BITCOIN_TESTNET",
}

export interface WalletInfo {
  address: string
  isConnected: boolean
  network: "mainnet" | "testnet"
  balance?: string
}

export interface WalletConnection {
  connect(walletType?: string): Promise<WalletInfo>
  disconnect(): Promise<void>
  getInfo(): Promise<WalletInfo>
  isConnected(): boolean
}

// Wallet service with support for multiple wallet types
class WalletService implements WalletConnection {
  private walletInfo: WalletInfo | null = null
  private unisat: any = null
  private listeners: { [key: string]: Function[] } = {}
  private mockAddresses = [
    "bc1p2em8l7wx3w6gn0w3wswz5scsagfzg6zhlpwuaqszwts29285mnjq4ca8n7",
  ]

  constructor() {
    // Check if we're in browser environment
    if (typeof window !== "undefined") {
      this.unisat = (window as any).unisat
    }
  }

  private async waitForUnisat(): Promise<any> {
    if (this.unisat) return this.unisat

    // Check if Unisat is already available
    this.unisat = (window as any).unisat
    if (this.unisat) return this.unisat

    // Wait for Unisat to be available with shorter intervals and timeout
    for (let i = 1; i <= 5; i++) {
      await new Promise((resolve) => setTimeout(resolve, 200 * i))
      this.unisat = (window as any).unisat
      if (this.unisat) {
        console.log(`✅ Unisat found after ${i} attempts`)
        return this.unisat
      }
    }

    throw new Error("Unisat wallet not found. Please install Unisat extension.")
  }

  private async switchToCorrectNetwork(): Promise<string> {
    try {
      console.log("🔄 Getting current network...")

      // Get current network
      const network = await this.unisat
        .getChain()
        .then((chain: any) => chain.enum)
      console.log("Wallet Current Network: ", network)

      // Determine target network
      const version = process.env.NEXT_PUBLIC_SYRON_VERSION
      const target_network =
        version === "testnet"
          ? UnisatNetworkType.testnet4
          : UnisatNetworkType.mainnet

      console.log(`Target network: ${target_network}`)

      // Switch if needed
      if (network !== target_network) {
        console.log(`🔄 Switching from ${network} to ${target_network}`)
        await this.unisat.switchChain(target_network)
        console.log(`✅ Switched to ${target_network}`)
        return target_network
      } else {
        console.log(`✅ Already on correct network: ${network}`)
        return network
      }
    } catch (error) {
      console.error("❌ Error switching network:", error)
      // Don't throw error, just return mainnet as fallback
      console.warn("⚠️ Using mainnet as fallback")
      return UnisatNetworkType.mainnet
    }
  }

  private setupEventListeners() {
    if (!this.unisat) return

    // Handle account changes - disconnect wallet
    this.unisat.on("accountsChanged", (accounts: string[]) => {
      console.log("Accounts changed, disconnecting wallet:", accounts)
      this.disconnect()
    })

    // Handle network changes - disconnect wallet
    this.unisat.on("networkChanged", () => {
      console.log("Network changed, disconnecting wallet")
      this.disconnect()
    })
  }

  private setupOKXEventListeners() {
    const okxwallet = (window as any).okxwallet
    if (!okxwallet) return

    // Handle account changes - disconnect wallet
    okxwallet.bitcoin.on("accountsChanged", (accounts: string[]) => {
      console.log("OKX accounts changed, disconnecting wallet:", accounts)
      this.disconnect()
    })

    // Handle network changes - disconnect wallet
    okxwallet.bitcoin.on("networkChanged", () => {
      console.log("OKX network changed, disconnecting wallet")
      this.disconnect()
    })
  }

  private notifyListeners(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((listener) => listener(data))
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback,
      )
    }
  }

  async connect(walletType: string = "demo"): Promise<WalletInfo> {
    switch (walletType) {
      case "unisat":
        return this.connectUnisat()
      case "okx":
        return this.connectOKX()
      case "demo":
      default:
        return this.connectDemo()
    }
  }

  private async connectDemo(): Promise<WalletInfo> {
    // Simulate wallet connection delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock successful connection
    this.walletInfo = {
      address:
        this.mockAddresses[
          Math.floor(Math.random() * this.mockAddresses.length)
        ],
      isConnected: true,
      network: "mainnet",
      balance: (Math.random() * 1).toFixed(8), // Random BTC balance
    }

    console.log("Demo wallet connected:", this.walletInfo)
    return this.walletInfo
  }

  private async connectUnisat(): Promise<WalletInfo> {
    try {
      console.log("🔄 Starting Unisat connection...")

      // Wait for Unisat to be available
      this.unisat = await this.waitForUnisat()
      console.log("✅ Unisat wallet found")

      // Setup event listeners
      this.setupEventListeners()
      console.log("✅ Event listeners setup")

      // Request accounts with timeout
      console.log("🔄 Requesting accounts...")
      const accountsPromise = this.unisat.requestAccounts()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Account request timeout")), 10000),
      )

      const accounts = (await Promise.race([
        accountsPromise,
        timeoutPromise,
      ])) as string[]

      if (accounts.length === 0) {
        throw new Error("No accounts found")
      }

      console.log("✅ Accounts received:", accounts[0])

      // Get current network and switch if needed
      const network = await this.switchToCorrectNetwork()

      // Get public key
      const publicKey = await this.unisat.getPublicKey()
      console.log("Wallet Public Key: ", publicKey)

      // Get balance
      const balance = await this.unisat.getBalance()
      console.log("Wallet Balance: ", JSON.stringify(balance, null, 2))

      // Map network to our internal format
      const internalNetwork =
        network === UnisatNetworkType.mainnet ? "mainnet" : "testnet"

      this.walletInfo = {
        address: accounts[0],
        isConnected: true,
        network: internalNetwork,
        balance: balance.total?.toString() || "0",
      }

      console.log("✅ Wallet info created")
      console.log("✅ Unisat wallet connected:", this.walletInfo)
      return this.walletInfo!
    } catch (error) {
      console.error("❌ Error connecting Unisat wallet:", error)
      // Clear any partial state
      this.unisat = null
      this.walletInfo = null
      throw error
    }
  }

  private async connectOKX(): Promise<WalletInfo> {
    try {
      const okxwallet = (window as any).okxwallet
      if (!okxwallet) {
        throw new Error("OKX wallet not found. Please install OKX extension.")
      }

      // Setup event listeners
      this.setupOKXEventListeners()
      console.log("✅ OKX event listeners setup")

      // Request accounts
      const accounts = await okxwallet.bitcoin.requestAccounts()

      if (accounts.length === 0) {
        throw new Error("No accounts found")
      }

      // Get balance
      const balance = await okxwallet.bitcoin.getBalance()
      const balanceTotal = balance.total?.toString() || "0"

      this.walletInfo = {
        address: accounts[0],
        isConnected: true,
        network: "mainnet", // OKX defaults to mainnet
        balance: balanceTotal,
      }

      console.log("OKX wallet connected:", this.walletInfo)
      return this.walletInfo
    } catch (error) {
      console.error("Error connecting OKX wallet:", error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    try {
      console.log("🔄 Wallet service disconnect started")
      console.log("Current wallet info:", this.walletInfo)

      // Don't call unisat.disconnect() as it prompts the wallet window
      // Just clear our local state and event listeners
      if (this.unisat) {
        console.log("ℹ️ Clearing Unisat event listeners and local state")
        // Remove event listeners if possible
        try {
          this.unisat.removeAllListeners?.()
        } catch (error) {
          console.warn("⚠️ Could not remove Unisat listeners:", error)
        }
      }

      // Clear OKX event listeners if needed
      const okxwallet = (window as any).okxwallet
      if (okxwallet) {
        console.log("ℹ️ Clearing OKX event listeners")
        try {
          okxwallet.bitcoin.removeAllListeners?.()
        } catch (error) {
          console.warn("⚠️ Could not remove OKX listeners:", error)
        }
      }

      // Always clear local state regardless of wallet type
      this.walletInfo = null
      this.unisat = null
      console.log("✅ Local wallet state cleared")

      // Always notify listeners
      this.notifyListeners("walletDisconnected", null)
      console.log("✅ Listeners notified")
    } catch (error) {
      console.error("❌ Error in disconnect process:", error)
      // Even if disconnect fails, clear local state
      this.walletInfo = null
      this.unisat = null
      this.notifyListeners("walletDisconnected", null)
      console.log("✅ State cleared after error")
    }
  }

  // Restore Unisat wallet without prompting for accounts
  async restoreUnisat(): Promise<WalletInfo> {
    try {
      console.log("🔄 Restoring Unisat wallet state...")

      // Wait for Unisat to be available
      this.unisat = await this.waitForUnisat()
      console.log("✅ Unisat wallet found")

      // Setup event listeners
      this.setupEventListeners()
      console.log("✅ Event listeners setup")

      // Get current accounts without requesting new ones
      const accounts = await this.unisat.getAccounts()
      if (accounts.length === 0) {
        throw new Error("No accounts found")
      }

      console.log("✅ Found existing accounts:", accounts[0])

      // Get current network and switch if needed
      const network = await this.switchToCorrectNetwork()

      // Get public key
      const publicKey = await this.unisat.getPublicKey()
      console.log("Wallet Public Key: ", publicKey)

      // Get balance
      const balance = await this.unisat.getBalance()
      console.log("Wallet Balance: ", JSON.stringify(balance, null, 2))

      // Map network to our internal format
      const internalNetwork =
        network === UnisatNetworkType.mainnet ? "mainnet" : "testnet"

      this.walletInfo = {
        address: accounts[0],
        isConnected: true,
        network: internalNetwork,
        balance: balance.total?.toString() || "0",
      }

      console.log("✅ Wallet info created")
      console.log("✅ Unisat wallet restored:", this.walletInfo)
      return this.walletInfo!
    } catch (error) {
      console.error("❌ Error restoring Unisat wallet:", error)
      // Clear any partial state
      this.unisat = null
      this.walletInfo = null
      throw error
    }
  }

  // Restore OKX wallet without prompting for accounts
  async restoreOKX(): Promise<WalletInfo> {
    try {
      console.log("🔄 Restoring OKX wallet state...")

      const okxwallet = (window as any).okxwallet
      if (!okxwallet) {
        throw new Error("OKX wallet not found")
      }

      // Get current accounts without requesting new ones
      const accounts = await okxwallet.bitcoin.getAccounts()
      if (accounts.length === 0) {
        throw new Error("No accounts found")
      }

      console.log("✅ Found existing OKX accounts:", accounts[0])

      // Get balance
      const balance = await okxwallet.bitcoin.getBalance()
      const balanceTotal = balance.total?.toString() || "0"

      this.walletInfo = {
        address: accounts[0],
        isConnected: true,
        network: "mainnet", // OKX defaults to mainnet
        balance: balanceTotal,
      }

      console.log("✅ OKX wallet restored:", this.walletInfo)
      return this.walletInfo
    } catch (error) {
      console.error("❌ Error restoring OKX wallet:", error)
      this.walletInfo = null
      throw error
    }
  }

  async getInfo(): Promise<WalletInfo> {
    if (!this.walletInfo) {
      throw new Error("Wallet not connected")
    }

    // For demo wallet, simulate getting updated info
    if (
      this.walletInfo.address &&
      this.mockAddresses.includes(this.walletInfo.address)
    ) {
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    return this.walletInfo
  }

  isConnected(): boolean {
    return this.walletInfo?.isConnected || false
  }

  getAddress(): string | null {
    return this.walletInfo?.address || null
  }

  // Check if Unisat is installed
  isUnisatInstalled(): boolean {
    return typeof window !== "undefined" && !!(window as any).unisat
  }

  // Check if OKX is installed
  isOKXInstalled(): boolean {
    return typeof window !== "undefined" && !!(window as any).okxwallet
  }

  // Check if an address is a demo address
  isDemoAddress(address: string): boolean {
    return this.mockAddresses.includes(address)
  }
}

export const walletService = new WalletService()
