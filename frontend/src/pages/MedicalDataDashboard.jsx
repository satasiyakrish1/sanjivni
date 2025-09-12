import { useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
} from "chart.js"
import { Bar, Line, Pie } from "react-chartjs-2"
import {
  Upload,
  FileText,
  AlertTriangle,
  X,
  Calendar,
  TrendingUp,
  Database,
  Users,
  User,
  Search,
  Download,
  Globe,
  Brain,
  Chrome,
} from "lucide-react"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
)

const MedicalDataDashboard = () => {
  // State management
  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [parsedData, setParsedData] = useState(null)
  const [filteredData, setFilteredData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState({ show: false, message: "", type: "success" })
  const [region, setRegion] = useState("all") // 'india', 'us', 'all'
  const [timeRange, setTimeRange] = useState("all") // 'month', 'quarter', 'year', 'all'
  const [searchTerm, setSearchTerm] = useState("")
  const [isAiAnalysisLoading, setIsAiAnalysisLoading] = useState(false)
  const [aiInsights, setAiInsights] = useState({
    salesPrediction: null,
    anomalyDetection: [],
    patientDemographics: {},
    recommendedInventory: [],
    seasonalTrends: {},
    doctorPrescriptionInsights: [],
  })

  const [analysisResults, setAnalysisResults] = useState({
    topMedicines: [],
    monthlySales: [],
    inventoryStatus: [],
    doctorPatterns: [],
    patientCategories: [],
    geographicalDistribution: [],
    paymentMethods: [],
    drugCategories: [],
  })

  const [activeTab, setActiveTab] = useState("dashboard")
  const [currency, setCurrency] = useState("₹") // Default to INR
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // Effect to filter data based on region selection
  useEffect(() => {
    if (parsedData) {
      filterDataByRegion()
    }
  }, [region, parsedData, searchTerm, timeRange])

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 5000)
  }

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/json": [".json"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFileUpload(acceptedFiles[0])
      }
    },
  })

  // Handle file upload
  const handleFileUpload = (selectedFile) => {
    setFile(selectedFile)
    setError(null)
    setActiveTab("dashboard")

    // Create file preview
    const fileInfo = {
      name: selectedFile.name,
      size: (selectedFile.size / 1024).toFixed(2) + " KB",
      type: selectedFile.type,
    }
    setFilePreview(fileInfo)

    // Parse the file
    parseFile(selectedFile)
  }

  // Filter data by region and search term
  const filterDataByRegion = () => {
    if (!parsedData) return

    let filtered = [...parsedData]

    // Filter by region if not 'all'
    if (region !== "all") {
      filtered = filtered.filter((item) => {
        const country = (item.country || item.region || "").toLowerCase()
        if (region === "india") {
          return country.includes("india")
        } else if (region === "us") {
          return country.includes("us") || country.includes("united states")
        }
        return true
      })
    }

    // Filter by search term if provided
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((item) => {
        return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(term))
      })
    }

    // Filter by time range
    if (timeRange !== "all" && filtered.length > 0) {
      const now = new Date()
      let cutoffDate

      switch (timeRange) {
        case "month":
          cutoffDate = new Date(now.setMonth(now.getMonth() - 1))
          break
        case "quarter":
          cutoffDate = new Date(now.setMonth(now.getMonth() - 3))
          break
        case "year":
          cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1))
          break
        default:
          cutoffDate = null
      }

      if (cutoffDate) {
        filtered = filtered.filter((item) => {
          const itemDate = new Date(item.date || item.purchaseDate || item.sale_date)
          return itemDate >= cutoffDate
        })
      }
    }

    // Set filtered data
    setFilteredData(filtered)

    // Re-analyze with filtered data
    analyzeData(filtered)

    // Update currency based on region
    if (region === "india") {
      setCurrency("₹")
    } else if (region === "us") {
      setCurrency("$")
    }
  }

  // Clear file and reset states
  const clearFile = () => {
    setFile(null)
    setFilePreview(null)
    setParsedData(null)
    setFilteredData([])
    setAnalysisResults({
      topMedicines: [],
      monthlySales: [],
      inventoryStatus: [],
      doctorPatterns: [],
      patientCategories: [],
      geographicalDistribution: [],
      paymentMethods: [],
      drugCategories: [],
    })
    setAiInsights({
      salesPrediction: null,
      anomalyDetection: [],
      patientDemographics: {},
      recommendedInventory: [],
      seasonalTrends: {},
      doctorPrescriptionInsights: [],
    })
    setRegion("all")
    setTimeRange("all")
    setSearchTerm("")
  }

  // Parse uploaded file based on type
  const parseFile = async (file) => {
    setIsLoading(true)
    try {
      const fileType = file.name.split(".").pop().toLowerCase()
      let data

      if (fileType === "csv") {
        // Parse CSV with better error handling
        data = await new Promise((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            delimitersToGuess: [",", "\t", "|", ";"],
            complete: (results) => {
              if (results.errors && results.errors.length) {
                reject(results.errors[0])
              } else {
                resolve(results.data)
              }
            },
            error: (error) => reject(error),
          })
        })
      } else if (fileType === "xlsx") {
        // Parse Excel
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        data = XLSX.utils.sheet_to_json(worksheet)
      } else if (fileType === "json") {
        // Parse JSON
        const text = await file.text()
        data = JSON.parse(text)
      }

      // Validate data
      if (!data || data.length === 0) {
        throw new Error("No data found in the file or unsupported format")
      }

      // Normalize column names
      data = normalizeColumnNames(data)

      setParsedData(data)
      setFilteredData(data)
      analyzeData(data)
      showToast("File uploaded and analyzed successfully!")

      // Detect region based on data
      detectRegion(data)

      // Run AI analysis
      runAiAnalysis(data)
    } catch (error) {
      console.error("Error parsing file:", error)
      setError(error.message || "Error parsing file. Please check the format.")
      showToast("Error parsing file. Please check the format.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Normalize column names to handle different naming conventions
  const normalizeColumnNames = (data) => {
    if (!data || data.length === 0) return data

    const normalizedData = data.map((item) => {
      const newItem = {}

      // Create a mapping of possible column names
      Object.keys(item).forEach((key) => {
        const lowerKey = key.toLowerCase()

        // Medicine name variations
        if (lowerKey.includes("medicine") || lowerKey.includes("drug") || lowerKey.includes("medication")) {
          newItem.medicine_name = item[key]
        }
        // Date variations
        else if (lowerKey.includes("date") || lowerKey.includes("time")) {
          newItem.date = item[key]
        }
        // Price/amount variations
        else if (
          lowerKey.includes("price") ||
          lowerKey.includes("amount") ||
          lowerKey.includes("cost") ||
          lowerKey.includes("total")
        ) {
          newItem.amount = Number.parseFloat(item[key]) || 0
        }
        // Quantity/stock variations
        else if (lowerKey.includes("quantity") || lowerKey.includes("stock") || lowerKey.includes("inventory")) {
          newItem.stock = Number.parseInt(item[key]) || 0
        }
        // Doctor variations
        else if (lowerKey.includes("doctor") || lowerKey.includes("physician") || lowerKey.includes("prescriber")) {
          newItem.doctor = item[key]
        }
        // Patient variations
        else if (lowerKey.includes("patient") || lowerKey.includes("customer") || lowerKey.includes("client")) {
          newItem.patient = item[key]
        }
        // Patient age
        else if (lowerKey.includes("age")) {
          newItem.age = Number.parseInt(item[key]) || 0
        }
        // Patient gender
        else if (lowerKey.includes("gender") || lowerKey.includes("sex")) {
          newItem.gender = item[key]
        }
        // Location/region
        else if (
          lowerKey.includes("location") ||
          lowerKey.includes("region") ||
          lowerKey.includes("area") ||
          lowerKey.includes("city") ||
          lowerKey.includes("state")
        ) {
          newItem.location = item[key]
        }
        // Country
        else if (lowerKey.includes("country") || lowerKey.includes("nation")) {
          newItem.country = item[key]
        }
        // Payment method
        else if (lowerKey.includes("payment") || lowerKey.includes("method")) {
          newItem.payment_method = item[key]
        }
        // Drug/medicine category
        else if (lowerKey.includes("category") || lowerKey.includes("type") || lowerKey.includes("class")) {
          newItem.drug_category = item[key]
        }
        // Keep original field as well
        newItem[key] = item[key]
      })

      return newItem
    })

    return normalizedData
  }

  // Auto-detect region based on data
  const detectRegion = (data) => {
    if (!data || data.length === 0) return

    // Look for indicators of India or US in the data
    let indiaCount = 0
    let usCount = 0

    data.forEach((item) => {
      // Check various fields for region indicators
      Object.values(item).forEach((value) => {
        if (!value) return
        const strValue = value.toString().toLowerCase()

        // Check for India indicators
        if (
          strValue.includes("india") ||
          strValue.includes("delhi") ||
          strValue.includes("mumbai") ||
          strValue.includes("rupee") ||
          strValue.includes("₹")
        ) {
          indiaCount++
        }

        // Check for US indicators
        if (
          strValue.includes("us") ||
          strValue.includes("united states") ||
          strValue.includes("america") ||
          strValue.includes("dollar") ||
          strValue.includes("$")
        ) {
          usCount++
        }
      })
    })

    // Set region based on indicators
    if (indiaCount > usCount && indiaCount > 0) {
      setRegion("india")
      setCurrency("₹")
    } else if (usCount > indiaCount && usCount > 0) {
      setRegion("us")
      setCurrency("$")
    }
  }

  // Run AI analysis on the data
  const runAiAnalysis = async (data) => {
    if (!data || data.length === 0) return

    setIsAiAnalysisLoading(true)

    try {
      // Simulate AI processing time
      setTimeout(() => {
        // 1. Sales Prediction (next 3 months)
        const monthlySalesData = generateMonthlySalesData(data)
        const salesPrediction = predictFutureSales(monthlySalesData)

        // 2. Anomaly Detection
        const anomalies = detectAnomalies(data)

        // 3. Patient Demographics Analysis
        const demographics = analyzePatientDemographics(data)

        // 4. Inventory Recommendations
        const inventoryRecs = generateInventoryRecommendations(data)

        // 5. Seasonal Disease Trends
        const seasonalTrends = analyzeSeasonal(data)

        // 6. Doctor Prescription Insights
        const doctorInsights = analyzeDoctorPrescriptions(data)

        // Set AI insights
        setAiInsights({
          salesPrediction,
          anomalyDetection: anomalies,
          patientDemographics: demographics,
          recommendedInventory: inventoryRecs,
          seasonalTrends,
          doctorPrescriptionInsights: doctorInsights,
        })

        setIsAiAnalysisLoading(false)
        showToast("AI analysis completed successfully!")
      }, 2000)
    } catch (error) {
      console.error("Error in AI analysis:", error)
      setIsAiAnalysisLoading(false)
      showToast("Error running AI analysis", "error")
    }
  }

  // Simulate sales prediction with a simple model
  const predictFutureSales = (monthlySales) => {
    if (!monthlySales || monthlySales.length < 3) return null

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()

    // Get last 3 months data to make future predictions
    const lastMonthsValues = monthlySales.slice(-3).map((item) => item.amount)
    const avgGrowth = (lastMonthsValues[1] / lastMonthsValues[0] + lastMonthsValues[2] / lastMonthsValues[1]) / 2

    // Predict next 3 months
    const nextMonthValue = lastMonthsValues[2] * avgGrowth
    const nextPlus1Value = nextMonthValue * avgGrowth
    const nextPlus2Value = nextPlus1Value * avgGrowth

    // Next 3 months labels
    const nextMonth = months[(currentMonth + 1) % 12]
    const nextPlus1 = months[(currentMonth + 2) % 12]
    const nextPlus2 = months[(currentMonth + 3) % 12]

    return {
      labels: [nextMonth, nextPlus1, nextPlus2],
      values: [nextMonthValue, nextPlus1Value, nextPlus2Value],
    }
  }

  // Generate monthly sales data from raw data
  const generateMonthlySalesData = (data) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthlySales = {}

    // Initialize all months with 0
    months.forEach((month) => {
      monthlySales[month] = 0
    })

    // Aggregate sales by month
    data.forEach((item) => {
      const date = item.date || item.purchaseDate || item.sale_date
      if (date) {
        try {
          const month = new Date(date).toLocaleString("default", { month: "short" })
          if (month !== "Invalid Date") {
            const amount = Number.parseFloat(item.amount || item.price || item.total || 0)
            if (!isNaN(amount)) {
              monthlySales[month] = (monthlySales[month] || 0) + amount
            }
          }
        } catch (e) {
          // Skip if date can't be parsed
        }
      }
    })

    // Convert to array format
    return Object.entries(monthlySales)
      .filter(([month, amount]) => amount > 0) // Only include months with sales
      .map(([month, amount]) => ({ month, amount }))
  }

  // Detect anomalies in the data
  const detectAnomalies = (data) => {
    if (!data || data.length < 10) return []

    const anomalies = []

    // 1. Detect price anomalies
    const prices = data
      .map((item) => Number.parseFloat(item.amount || item.price || 0))
      .filter((price) => !isNaN(price) && price > 0)
    if (prices.length > 0) {
      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
      const stdDev = Math.sqrt(prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length)
      const threshold = 3 * stdDev // 3 sigma rule

      data.forEach((item, index) => {
        const price = Number.parseFloat(item.amount || item.price || 0)
        if (Math.abs(price - avgPrice) > threshold) {
          anomalies.push({
            type: "price",
            description: `Unusual price detected (${currency}${price.toFixed(2)})`,
            item: item.medicine_name || `Record #${index + 1}`,
            severity: "high",
          })
        }
      })
    }

    // 2. Detect inventory anomalies
    const stocks = data
      .map((item) => Number.parseInt(item.stock || item.quantity || 0))
      .filter((stock) => !isNaN(stock) && stock >= 0)
    if (stocks.length > 0) {
      data.forEach((item, index) => {
        const stock = Number.parseInt(item.stock || item.quantity || 0)
        if (stock === 0) {
          anomalies.push({
            type: "stock",
            description: "Out of stock",
            item: item.medicine_name || `Record #${index + 1}`,
            severity: "high",
          })
        } else if (stock <= 5) {
          anomalies.push({
            type: "stock",
            description: "Low stock",
            item: item.medicine_name || `Record #${index + 1}`,
            severity: "medium",
          })
        }
      })
    }

    // 3. Detect unusual prescription patterns
    const doctors = {}
    data.forEach((item) => {
      const doctor = item.doctor || item.doctor_name || item.prescribedBy
      const medicine = item.medicine_name || item.medicineName || item.medicine
      if (doctor && medicine) {
        if (!doctors[doctor]) {
          doctors[doctor] = {}
        }
        doctors[doctor][medicine] = (doctors[doctor][medicine] || 0) + 1
      }
    })

    Object.entries(doctors).forEach(([doctor, prescriptions]) => {
      // If a doctor prescribes the same medicine excessively
      Object.entries(prescriptions).forEach(([medicine, count]) => {
        const totalPrescriptions = Object.values(prescriptions).reduce((sum, val) => sum + val, 0)
        const percentage = (count / totalPrescriptions) * 100

        if (count > 10 && percentage > 70) {
          anomalies.push({
            type: "prescription",
            description: `Dr. ${doctor} prescribes ${medicine} in ${percentage.toFixed(1)}% of cases`,
            item: `${medicine} (${count} prescriptions)`,
            severity: "medium",
          })
        }
      })
    })

    return anomalies
  }

  // Analyze patient demographics
  const analyzePatientDemographics = (data) => {
    const demographics = {
      ageGroups: {},
      genderDistribution: {},
      conditionsByAge: {},
    }

    // Age distribution
    const ageGroups = {
      "Under 18": 0,
      "18-30": 0,
      "31-45": 0,
      "46-60": 0,
      "Over 60": 0,
    }

    // Gender distribution
    const genders = {}

    // Conditions by age group
    const conditionsByAge = {
      "Under 18": {},
      "18-30": {},
      "31-45": {},
      "46-60": {},
      "Over 60": {},
    }

    data.forEach((item) => {
      // Process age groups
      const age = Number.parseInt(item.age || 0)
      if (age > 0) {
        let ageGroup
        if (age < 18) ageGroup = "Under 18"
        else if (age <= 30) ageGroup = "18-30"
        else if (age <= 45) ageGroup = "31-45"
        else if (age <= 60) ageGroup = "46-60"
        else ageGroup = "Over 60"

        ageGroups[ageGroup] = (ageGroups[ageGroup] || 0) + 1

        // Process conditions by age
        const medicine = item.medicine_name || item.medicineName || item.medicine
        if (medicine) {
          conditionsByAge[ageGroup][medicine] = (conditionsByAge[ageGroup][medicine] || 0) + 1
        }
      }

      // Process gender
      const gender = (item.gender || item.sex || "").toLowerCase()
      if (gender) {
        let normalizedGender
        if (gender.includes("m")) normalizedGender = "Male"
        else if (gender.includes("f")) normalizedGender = "Female"
        else normalizedGender = "Other"

        genders[normalizedGender] = (genders[normalizedGender] || 0) + 1
      }
    })

    // Format age groups for chart
    demographics.ageGroups = Object.entries(ageGroups)
      .filter(([group, count]) => count > 0)
      .map(([group, count]) => ({ group, count }))

    // Format gender distribution for chart
    demographics.genderDistribution = Object.entries(genders)
      .filter(([gender, count]) => count > 0)
      .map(([gender, count]) => ({ gender, count }))

    // Get top conditions by age group
    Object.entries(conditionsByAge).forEach(([ageGroup, conditions]) => {
      demographics.conditionsByAge[ageGroup] = Object.entries(conditions)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([condition, count]) => ({ condition, count }))
    })

    return demographics
  }

  // Generate inventory recommendations
  const generateInventoryRecommendations = (data) => {
    if (!data || data.length === 0) return []

    // Get sales frequency
    const medicineFrequency = {}
    data.forEach((item) => {
      const medicine = item.medicine_name || item.medicineName || item.medicine
      const stock = Number.parseInt(item.stock || item.quantity || 0)

      if (medicine) {
        if (!medicineFrequency[medicine]) {
          medicineFrequency[medicine] = { sales: 0, stock: stock || 0 }
        }
        medicineFrequency[medicine].sales++
        // Use the most recent stock level
        medicineFrequency[medicine].stock = stock || medicineFrequency[medicine].stock
      }
    })

    // Calculate recommended inventory
    const recommendations = Object.entries(medicineFrequency).map(([medicine, data]) => {
      const { sales, stock } = data
      const monthlyRate = sales / 3 // Assume data spans 3 months
      const recommendedStock = Math.ceil(monthlyRate * 2) // 2 months of inventory
      const orderNeeded = Math.max(0, recommendedStock - stock)

      return {
        medicine,
        currentStock: stock,
        recommendedStock,
        orderNeeded,
        priority: orderNeeded > 0 ? (stock === 0 ? "high" : "medium") : "low",
      }
    })

    // Sort by priority and order needed
    return recommendations
      .sort((a, b) => {
        if (a.priority === "high" && b.priority !== "high") return -1
        if (a.priority !== "high" && b.priority === "high") return 1
        return b.orderNeeded - a.orderNeeded
      })
      .slice(0, 10)
  }

  // Analyze seasonal trends
  const analyzeSeasonal = (data) => {
    const seasons = {
      "Winter (Dec-Feb)": {},
      "Spring (Mar-May)": {},
      "Summer (Jun-Aug)": {},
      "Fall (Sep-Nov)": {},
    }

    // Map months to seasons
    const monthToSeason = {
      0: "Winter (Dec-Feb)",
      1: "Winter (Dec-Feb)",
      2: "Spring (Mar-May)",
      3: "Spring (Mar-May)",
      4: "Spring (Mar-May)",
      5: "Summer (Jun-Aug)",
      6: "Summer (Jun-Aug)",
      7: "Summer (Jun-Aug)",
      8: "Fall (Sep-Nov)",
      9: "Fall (Sep-Nov)",
      10: "Fall (Sep-Nov)",
      11: "Winter (Dec-Feb)",
    }

    // Count medicine frequency by season
    data.forEach((item) => {
      const date = item.date || item.purchaseDate || item.sale_date
      const medicine = item.medicine_name || item.medicineName || item.medicine

      if (date && medicine) {
        try {
          const month = new Date(date).getMonth()
          const season = monthToSeason[month]

          if (!seasons[season][medicine]) {
            seasons[season][medicine] = 0
          }
          seasons[season][medicine]++
        } catch (e) {
          // Skip if date can't be parsed
        }
      }
    })

    // Get top medicines for each season
    const result = {}
    Object.entries(seasons).forEach(([season, medicines]) => {
      result[season] = Object.entries(medicines)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([medicine, count]) => ({ medicine, count }))
    })

    return result
  }

  // Analyze doctor prescription patterns
  const analyzeDoctorPrescriptions = (data) => {
    const doctorPrescriptions = {}

    // Collect prescriptions by doctor
    data.forEach((item) => {
      const doctor = item.doctor || item.doctor_name || item.prescribedBy
      const medicine = item.medicine_name || item.medicineName || item.medicine
      const category = item.drug_category || item.category || "Unknown"

      if (doctor && medicine) {
        if (!doctorPrescriptions[doctor]) {
          doctorPrescriptions[doctor] = {
            prescriptionCount: 0,
            medicines: {},
            categories: {},
          }
        }

        doctorPrescriptions[doctor].prescriptionCount++

        // Count medicines
        if (!doctorPrescriptions[doctor].medicines[medicine]) {
          doctorPrescriptions[doctor].medicines[medicine] = 0
        }
        doctorPrescriptions[doctor].medicines[medicine]++

        // Count categories
        if (!doctorPrescriptions[doctor].categories[category]) {
          doctorPrescriptions[doctor].categories[category] = 0
        }
        doctorPrescriptions[doctor].categories[category]++
      }
    })

    // Format results
    return Object.entries(doctorPrescriptions)
      .sort((a, b) => b[1].prescriptionCount - a[1].prescriptionCount)
      .slice(0, 5)
      .map(([doctor, data]) => {
        // Get top medicines prescribed by this doctor
        const topMedicines = Object.entries(data.medicines)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([medicine, count]) => ({ medicine, count }))

        // Get category distribution
        const topCategories = Object.entries(data.categories)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([category, count]) => ({ category, count }))

        return {
          doctor,
          prescriptionCount: data.prescriptionCount,
          topMedicines,
          topCategories,
        }
      })
  }

  // Analyze data and set analysis results
  const analyzeData = (data) => {
    if (!data || data.length === 0) return

    // 1. Top Medicines Analysis
    const medicineCount = {}
    data.forEach((item) => {
      const medicine = item.medicine_name || item.medicineName || item.medicine
      if (medicine) {
        medicineCount[medicine] = (medicineCount[medicine] || 0) + 1
      }
    })

    const topMedicines = Object.entries(medicineCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    // 2. Monthly Sales Analysis
    const monthlySales = generateMonthlySalesData(data)

    // 3. Inventory Status
    const inventoryStatus = {}
    data.forEach((item) => {
      const medicine = item.medicine_name || item.medicineName || item.medicine
      const stock = Number.parseInt(item.stock || item.quantity || 0)

      if (medicine && !isNaN(stock)) {
        // Keep the lowest stock level for each medicine
        if (!inventoryStatus[medicine] || stock < inventoryStatus[medicine]) {
          inventoryStatus[medicine] = stock
        }
      }
    })

    const lowStockItems = Object.entries(inventoryStatus)
      .filter(([_, stock]) => stock < 20)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 5)
      .map(([name, stock]) => ({ name, stock }))

    // 4. Doctor Prescription Patterns
    const doctorPatterns = {}
    data.forEach((item) => {
      const doctor = item.doctor || item.doctor_name || item.prescribedBy
      if (doctor) {
        doctorPatterns[doctor] = (doctorPatterns[doctor] || 0) + 1
      }
    })

    const topDoctors = Object.entries(doctorPatterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    // 5. Patient Categories
    const patientAgeGroups = {
      "Under 18": 0,
      "18-30": 0,
      "31-45": 0,
      "46-60": 0,
      "Over 60": 0,
    }

    data.forEach((item) => {
      const age = Number.parseInt(item.age || 0)
      if (age > 0) {
        let ageGroup
        if (age < 18) ageGroup = "Under 18"
        else if (age <= 30) ageGroup = "18-30"
        else if (age <= 45) ageGroup = "31-45"
        else if (age <= 60) ageGroup = "46-60"
        else ageGroup = "Over 60"

        patientAgeGroups[ageGroup]++
      }
    })

    const patientCategories = Object.entries(patientAgeGroups)
      .filter(([_, count]) => count > 0)
      .map(([group, count]) => ({ group, count }))

    // 6. Geographical Distribution
    const locations = {}
    data.forEach((item) => {
      const location = item.location || item.city || item.region || "Unknown"
      if (location) {
        locations[location] = (locations[location] || 0) + 1
      }
    })

    const geographicalDistribution = Object.entries(locations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }))

    // 7. Payment Methods
    const payments = {}
    data.forEach((item) => {
      const method = item.payment_method || item.paymentMethod || "Unknown"
      if (method) {
        payments[method] = (payments[method] || 0) + 1
      }
    })

    const paymentMethods = Object.entries(payments)
      .sort((a, b) => b[1] - a[1])
      .map(([method, count]) => ({ method, count }))

    // 8. Drug Categories
    const categories = {}
    data.forEach((item) => {
      const category = item.drug_category || item.category || "Unknown"
      if (category) {
        categories[category] = (categories[category] || 0) + 1
      }
    })

    const drugCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }))

    // Set analysis results
    setAnalysisResults({
      topMedicines,
      monthlySales,
      inventoryStatus: lowStockItems,
      doctorPatterns: topDoctors,
      patientCategories,
      geographicalDistribution,
      paymentMethods,
      drugCategories,
    })
  }

  // Render the AI Insights tab content
  const renderAiInsightsTab = () => {
    if (isAiAnalysisLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg text-blue-600">AI is analyzing your data...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      )
    }

    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-center text-blue-800">AI-Powered Insights</h2>

        {/* Sales Prediction */}
        {aiInsights.salesPrediction && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
              Sales Forecast (Next 3 Months)
            </h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: aiInsights.salesPrediction.labels,
                  datasets: [
                    {
                      label: `Predicted Sales (${currency})`,
                      data: aiInsights.salesPrediction.values,
                      backgroundColor: "rgba(54, 162, 235, 0.6)",
                      borderColor: "rgba(54, 162, 235, 1)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>
                Based on historical trends, we predict a{" "}
                {aiInsights.salesPrediction.values[2] > aiInsights.salesPrediction.values[0] ? "growth" : "decline"} in
                sales over the next quarter.
              </p>
            </div>
          </div>
        )}

        {/* Anomaly Detection */}
        {aiInsights.anomalyDetection.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              Detected Anomalies
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Item
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Severity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {aiInsights.anomalyDetection.map((anomaly, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{anomaly.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{anomaly.item}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{anomaly.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            anomaly.severity === "high"
                              ? "bg-red-100 text-red-800"
                              : anomaly.severity === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {anomaly.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inventory Recommendations */}
        {aiInsights.recommendedInventory.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <Database className="h-5 w-5 text-purple-500 mr-2" />
              Inventory Recommendations
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Medicine
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Current Stock
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Recommended
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Order Needed
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Priority
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {aiInsights.recommendedInventory.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.medicine}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.currentStock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.recommendedStock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.orderNeeded}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.priority === "high"
                              ? "bg-red-100 text-red-800"
                              : item.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Patient Demographics */}
        {aiInsights.patientDemographics.ageGroups && aiInsights.patientDemographics.ageGroups.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <Users className="h-5 w-5 text-green-500 mr-2" />
              Patient Demographics
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Age Distribution */}
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-2">Age Distribution</h4>
                <div className="h-64">
                  <Pie
                    data={{
                      labels: aiInsights.patientDemographics.ageGroups.map((item) => item.group),
                      datasets: [
                        {
                          data: aiInsights.patientDemographics.ageGroups.map((item) => item.count),
                          backgroundColor: [
                            "rgba(255, 99, 132, 0.6)",
                            "rgba(54, 162, 235, 0.6)",
                            "rgba(255, 206, 86, 0.6)",
                            "rgba(75, 192, 192, 0.6)",
                            "rgba(153, 102, 255, 0.6)",
                          ],
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              </div>

              {/* Gender Distribution */}
              {aiInsights.patientDemographics.genderDistribution &&
                aiInsights.patientDemographics.genderDistribution.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-2">Gender Distribution</h4>
                    <div className="h-64">
                      <Pie
                        data={{
                          labels: aiInsights.patientDemographics.genderDistribution.map((item) => item.gender),
                          datasets: [
                            {
                              data: aiInsights.patientDemographics.genderDistribution.map((item) => item.count),
                              backgroundColor: [
                                "rgba(54, 162, 235, 0.6)",
                                "rgba(255, 99, 132, 0.6)",
                                "rgba(255, 206, 86, 0.6)",
                              ],
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Seasonal Trends */}
        {Object.keys(aiInsights.seasonalTrends).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <Calendar className="h-5 w-5 text-orange-500 mr-2" />
              Seasonal Medicine Trends
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(aiInsights.seasonalTrends).map(
                ([season, medicines]) =>
                  medicines.length > 0 && (
                    <div key={season} className="border rounded-lg p-4">
                      <h4 className="text-md font-medium text-gray-700 mb-2">{season}</h4>
                      <ul className="space-y-2">
                        {medicines.map((item, index) => (
                          <li key={index} className="flex justify-between">
                            <span className="text-sm text-gray-600">{item.medicine}</span>
                            <span className="text-sm font-medium">{item.count} prescriptions</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ),
              )}
            </div>
          </div>
        )}

        {/* Doctor Prescription Insights */}
        {aiInsights.doctorPrescriptionInsights.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <User className="h-5 w-5 text-blue-500 mr-2" />
              Doctor Prescription Insights
            </h3>
            <div className="space-y-6">
              {aiInsights.doctorPrescriptionInsights.map((doctor, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Dr. {doctor.doctor}</h4>
                  <p className="text-sm text-gray-500 mb-3">Total Prescriptions: {doctor.prescriptionCount}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Top Medicines */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Most Prescribed Medicines</h5>
                      <ul className="space-y-1">
                        {doctor.topMedicines.map((med, idx) => (
                          <li key={idx} className="text-sm flex justify-between">
                            <span>{med.medicine}</span>
                            <span className="font-medium">{med.count}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Top Categories */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Top Categories</h5>
                      <ul className="space-y-1">
                        {doctor.topCategories.map((cat, idx) => (
                          <li key={idx} className="text-sm flex justify-between">
                            <span>{cat.category}</span>
                            <span className="font-medium">{cat.count}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render the inventory tab content
  const renderInventoryTab = () => {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-center text-blue-800">Inventory Management</h2>

        {/* Inventory Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Current Inventory Status</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Medicine
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Current Stock
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData
                  .filter(
                    (item, index, self) =>
                      // Filter unique medicines
                      index === self.findIndex((t) => t.medicine_name === item.medicine_name),
                  )
                  .map((item, index) => {
                    const stock = Number.parseInt(item.stock || item.quantity || 0)
                    let status = "Normal"
                    let statusColor = "bg-green-100 text-green-800"

                    if (stock === 0) {
                      status = "Out of Stock"
                      statusColor = "bg-red-100 text-red-800"
                    } else if (stock < 10) {
                      status = "Low Stock"
                      statusColor = "bg-yellow-100 text-yellow-800"
                    }

                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.medicine_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Low Stock Items</h3>
          <div className="h-64">
            {analysisResults.inventoryStatus.length > 0 ? (
              <Bar
                data={{
                  labels: analysisResults.inventoryStatus.map((item) => item.name),
                  datasets: [
                    {
                      label: "Stock Level",
                      data: analysisResults.inventoryStatus.map((item) => item.stock),
                      backgroundColor: "rgba(255, 99, 132, 0.6)",
                      borderColor: "rgba(255, 99, 132, 1)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: "y",
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">No low stock items found</div>
            )}
          </div>
        </div>

        {/* Inventory Recommendations */}
        {aiInsights.recommendedInventory.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Recommended Orders</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Medicine
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Current Stock
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Recommended
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Order Quantity
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Priority
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {aiInsights.recommendedInventory
                    .filter((item) => item.orderNeeded > 0)
                    .map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.medicine}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.currentStock}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.recommendedStock}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.orderNeeded}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : item.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {item.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render the prescriptions tab content
  const renderPrescriptionsTab = () => {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-center text-blue-800">Prescription Analysis</h2>

        {/* Doctor Prescription Patterns */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Doctor Prescription Patterns</h3>
          <div className="h-64">
            {analysisResults.doctorPatterns.length > 0 ? (
              <Pie
                data={{
                  labels: analysisResults.doctorPatterns.map((item) => item.name),
                  datasets: [
                    {
                      data: analysisResults.doctorPatterns.map((item) => item.count),
                      backgroundColor: [
                        "rgba(54, 162, 235, 0.6)",
                        "rgba(255, 99, 132, 0.6)",
                        "rgba(255, 206, 86, 0.6)",
                        "rgba(75, 192, 192, 0.6)",
                        "rgba(153, 102, 255, 0.6)",
                      ],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">No doctor data available</div>
            )}
          </div>
        </div>

        {/* Top Medicines */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Most Prescribed Medicines</h3>
          <div className="h-64">
            {analysisResults.topMedicines.length > 0 ? (
              <Bar
                data={{
                  labels: analysisResults.topMedicines.map((item) => item.name),
                  datasets: [
                    {
                      label: "Prescription Count",
                      data: analysisResults.topMedicines.map((item) => item.count),
                      backgroundColor: [
                        "rgba(75, 192, 192, 0.6)",
                        "rgba(54, 162, 235, 0.6)",
                        "rgba(153, 102, 255, 0.6)",
                        "rgba(255, 159, 64, 0.6)",
                        "rgba(255, 99, 132, 0.6)",
                      ],
                      borderColor: [
                        "rgba(75, 192, 192, 1)",
                        "rgba(54, 162, 235, 1)",
                        "rgba(153, 102, 255, 1)",
                        "rgba(255, 159, 64, 1)",
                        "rgba(255, 99, 132, 1)",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">No medicine data available</div>
            )}
          </div>
        </div>

        {/* Doctor Insights */}
        {aiInsights.doctorPrescriptionInsights.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Doctor Prescription Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiInsights.doctorPrescriptionInsights.map((doctor, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Dr. {doctor.doctor}</h4>
                  <p className="text-sm text-gray-500 mb-3">Total Prescriptions: {doctor.prescriptionCount}</p>

                  <h5 className="text-sm font-medium text-gray-600 mb-2">Most Prescribed Medicines</h5>
                  <ul className="space-y-1 mb-3">
                    {doctor.topMedicines.map((med, idx) => (
                      <li key={idx} className="text-sm flex justify-between">
                        <span>{med.medicine}</span>
                        <span className="font-medium">{med.count}</span>
                      </li>
                    ))}
                  </ul>

                  <h5 className="text-sm font-medium text-gray-600 mb-2">Top Categories</h5>
                  <ul className="space-y-1">
                    {doctor.topCategories.map((cat, idx) => (
                      <li key={idx} className="text-sm flex justify-between">
                        <span>{cat.category}</span>
                        <span className="font-medium">{cat.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prescription List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Prescriptions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Doctor
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Patient
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Medicine
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.slice(0, 10).map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.date ? new Date(item.date).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.doctor || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.patient || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.medicine_name || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity || item.stock || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // Render the sales tab content
  const renderSalesTab = () => {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-center text-blue-800">Sales Analysis</h2>

        {/* Monthly Sales Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Monthly Sales Trend</h3>
          <div className="h-64">
            {analysisResults.monthlySales.length > 0 ? (
              <Line
                data={{
                  labels: analysisResults.monthlySales.map((item) => item.month),
                  datasets: [
                    {
                      label: `Monthly Sales (${currency})`,
                      data: analysisResults.monthlySales.map((item) => item.amount),
                      fill: false,
                      backgroundColor: "rgba(54, 162, 235, 0.6)",
                      borderColor: "rgba(54, 162, 235, 1)",
                      tension: 0.1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">No sales data available</div>
            )}
          </div>
        </div>

        {/* Sales by Medicine */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Sales by Medicine</h3>
          <div className="h-64">
            {analysisResults.topMedicines.length > 0 ? (
              <Bar
                data={{
                  labels: analysisResults.topMedicines.map((item) => item.name),
                  datasets: [
                    {
                      label: "Sales Count",
                      data: analysisResults.topMedicines.map((item) => item.count),
                      backgroundColor: "rgba(75, 192, 192, 0.6)",
                      borderColor: "rgba(75, 192, 192, 1)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">No sales data available</div>
            )}
          </div>
        </div>

        {/* Sales Prediction */}
        {aiInsights.salesPrediction && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Sales Forecast (Next 3 Months)</h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: aiInsights.salesPrediction.labels,
                  datasets: [
                    {
                      label: `Predicted Sales (${currency})`,
                      data: aiInsights.salesPrediction.values,
                      backgroundColor: "rgba(54, 162, 235, 0.6)",
                      borderColor: "rgba(54, 162, 235, 1)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>
                Based on historical trends, we predict a{" "}
                {aiInsights.salesPrediction.values[2] > aiInsights.salesPrediction.values[0] ? "growth" : "decline"} in
                sales over the next quarter.
              </p>
            </div>
          </div>
        )}

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Payment Methods</h3>
          <div className="h-64">
            {analysisResults.paymentMethods.length > 0 ? (
              <Pie
                data={{
                  labels: analysisResults.paymentMethods.map((item) => item.method),
                  datasets: [
                    {
                      data: analysisResults.paymentMethods.map((item) => item.count),
                      backgroundColor: [
                        "rgba(54, 162, 235, 0.6)",
                        "rgba(255, 99, 132, 0.6)",
                        "rgba(255, 206, 86, 0.6)",
                        "rgba(75, 192, 192, 0.6)",
                        "rgba(153, 102, 255, 0.6)",
                      ],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No payment method data available
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Render the patients tab content
  const renderPatientsTab = () => {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-center text-blue-800">Patient Analysis</h2>

        {/* Patient Age Groups */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Patient Age Distribution</h3>
          <div className="h-64">
            {analysisResults.patientCategories.length > 0 ? (
              <Pie
                data={{
                  labels: analysisResults.patientCategories.map((item) => item.group),
                  datasets: [
                    {
                      data: analysisResults.patientCategories.map((item) => item.count),
                      backgroundColor: [
                        "rgba(255, 99, 132, 0.6)",
                        "rgba(54, 162, 235, 0.6)",
                        "rgba(255, 206, 86, 0.6)",
                        "rgba(75, 192, 192, 0.6)",
                        "rgba(153, 102, 255, 0.6)",
                      ],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">No patient age data available</div>
            )}
          </div>
        </div>

        {/* Geographical Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Geographical Distribution</h3>
          <div className="h-64">
            {analysisResults.geographicalDistribution.length > 0 ? (
              <Bar
                data={{
                  labels: analysisResults.geographicalDistribution.map((item) => item.location),
                  datasets: [
                    {
                      label: "Patient Count",
                      data: analysisResults.geographicalDistribution.map((item) => item.count),
                      backgroundColor: "rgba(153, 102, 255, 0.6)",
                      borderColor: "rgba(153, 102, 255, 1)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No geographical data available
              </div>
            )}
          </div>
        </div>

        {/* Patient Demographics */}
        {aiInsights.patientDemographics.conditionsByAge &&
          Object.keys(aiInsights.patientDemographics.conditionsByAge).length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Common Conditions by Age Group</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(aiInsights.patientDemographics.conditionsByAge).map(
                  ([ageGroup, conditions]) =>
                    conditions.length > 0 && (
                      <div key={ageGroup} className="border rounded-lg p-4">
                        <h4 className="text-md font-medium text-gray-700 mb-2">{ageGroup}</h4>
                        <ul className="space-y-2">
                          {conditions.map((item, index) => (
                            <li key={index} className="flex justify-between">
                              <span className="text-sm text-gray-600">{item.condition}</span>
                              <span className="text-sm font-medium">{item.count} cases</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ),
                )}
              </div>
            </div>
          )}

        {/* Patient List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Patient Records</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Patient
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Age
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Gender
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Last Visit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData
                  .filter(
                    (item, index, self) =>
                      // Filter unique patients
                      item.patient && index === self.findIndex((t) => t.patient === item.patient),
                  )
                  .slice(0, 10)
                  .map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.patient || `Patient #${index + 1}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.age || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.gender || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.location || item.city || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.date ? new Date(item.date).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const handleInstallExtension = () => {
    // Check if the browser is Chrome
    if (navigator.userAgent.indexOf('Chrome') === -1) {
      showToast('This extension is currently only available for Google Chrome.', 'error');
      return;
    }

    // Show installation guide
    setShowInstallGuide(true);
  };

  const handleDownloadExtension = () => {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = '/extension.zip';
    link.download = 'prescripto-medical-dashboard.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Medical Data Dashboard</h1>
            <button
              onClick={handleInstallExtension}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-opacity-90 transition-all"
            >
              <Chrome size={20} />
              Install Extension
            </button>
          </div>
        </div>
      </div>

      {/* Extension Download Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Enhance Your Dashboard Experience</h2>
              <p className="text-blue-100 mb-4">
                Install our Chrome extension to access advanced features, real-time updates, and seamless data management.
              </p>
              <ul className="space-y-2 text-blue-100">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Real-time data synchronization
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Advanced analytics and insights
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Offline data access
                </li>
              </ul>
            </div>
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleInstallExtension}
                className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg"
              >
                <Chrome size={24} />
                Download Extension
              </button>
              <span className="text-sm text-blue-200">Compatible with Google Chrome</span>
            </div>
          </div>
        </div>
      </div>

      {/* Installation Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Installation Guide</h2>
            <div className="space-y-4">
              <p className="text-gray-700">Follow these steps to install the extension:</p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Click the "Download Extension" button below</li>
                <li>Extract the downloaded ZIP file</li>
                <li>Open Chrome and go to <code className="bg-gray-100 px-2 py-1 rounded">chrome://extensions/</code></li>
                <li>Enable "Developer mode" in the top right corner</li>
                <li>Click "Load unpacked" and select the extracted folder</li>
                <li>The extension will be installed and ready to use!</li>
              </ol>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setShowInstallGuide(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
                <button 
                  onClick={handleDownloadExtension}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-opacity-90 transition-all"
                >
                  Download Extension
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center ${toast.type === "success" ? "bg-green-500" : "bg-red-500"} text-white`}
        >
          <span>{toast.message}</span>
          <button onClick={() => setToast({ show: false, message: "", type: "success" })} className="ml-3">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Region Selection */}
          {parsedData && (
          <div className="flex space-x-4 mb-6">
              <div className="relative inline-block">
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="block appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Regions</option>
                  <option value="india">India</option>
                  <option value="us">United States</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <Globe size={16} />
                </div>
              </div>

              <div className="relative inline-block">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="block appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <Calendar size={16} />
                </div>
              </div>
            </div>
          )}

        {/* Navigation Tabs */}
        {parsedData && (
          <div className="mb-6">
            <nav className="flex space-x-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`py-3 px-4 text-sm font-medium ${
                  activeTab === "dashboard"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("ai-insights")}
                className={`py-3 px-4 text-sm font-medium flex items-center ${
                  activeTab === "ai-insights"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Brain size={16} className="mr-1" />
                AI Insights
              </button>
              <button
                onClick={() => setActiveTab("inventory")}
                className={`py-3 px-4 text-sm font-medium ${
                  activeTab === "inventory"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Inventory
              </button>
              <button
                onClick={() => setActiveTab("prescriptions")}
                className={`py-3 px-4 text-sm font-medium ${
                  activeTab === "prescriptions"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Prescriptions
              </button>
              <button
                onClick={() => setActiveTab("sales")}
                className={`py-3 px-4 text-sm font-medium ${
                  activeTab === "sales"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Sales
              </button>
              <button
                onClick={() => setActiveTab("patients")}
                className={`py-3 px-4 text-sm font-medium ${
                  activeTab === "patients"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Patients
              </button>
            </nav>
          </div>
        )}

        {/* Search Box */}
        {parsedData && (
          <div className="mb-6 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search in data..."
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Search size={16} />
              </div>
            </div>
          </div>
        )}

        {/* File Upload Section - Only show when no data is loaded */}
        {!parsedData && (
          <div className="mb-10 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-blue-700">Upload Medical Store Data</h2>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                <Upload className="h-12 w-12 text-blue-500 mb-3" />
                {isDragActive ? (
                  <p className="text-blue-500">Drop the file here...</p>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-1">Drag & drop a file here, or click to select</p>
                    <p className="text-sm text-gray-500">Supported formats: CSV, XLSX, JSON</p>
                    <p className="mt-2 text-xs text-gray-400">
                      Data should include fields like medicine, doctor, quantity, date, price, etc.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-red-700 font-medium">Error</p>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* File Preview */}
            {filePreview && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-700">File Details:</h3>
                  <button onClick={clearFile} className="text-gray-500 hover:text-red-500">
                    <X size={16} />
                  </button>
                </div>
                <div className="mt-2 flex items-center">
                  <FileText className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p>
                      <span className="font-medium">Name:</span> {filePreview.name}
                    </p>
                    <p>
                      <span className="font-medium">Size:</span> {filePreview.size}
                    </p>
                    <p>
                      <span className="font-medium">Type:</span> {filePreview.type}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="mt-4 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
        )}

        {/* Dashboard Content */}
        {parsedData && !isLoading && activeTab === "dashboard" && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-6 text-center text-blue-800">Data Analysis Dashboard</h2>

            {/* Dashboard Actions */}
            <div className="flex justify-between mb-6">
              <div>
                <button
                  onClick={clearFile}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
                >
                  <X size={16} className="mr-2" /> Clear Data
                </button>
              </div>
              <div>
                <button
                  onClick={() => {
                    /* Export functionality */
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
                >
                  <Download size={16} className="mr-2" /> Export Report
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Total Records</h3>
                <p className="text-3xl font-bold text-blue-600">{filteredData.length.toLocaleString()}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Top Medicine</h3>
                <p className="text-3xl font-bold text-green-600">
                  {analysisResults.topMedicines.length > 0 ? analysisResults.topMedicines[0].name : "N/A"}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Total Sales</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {currency}
                  {analysisResults.monthlySales
                    .reduce((sum, item) => sum + item.amount, 0)
                    .toFixed(2)
                    .toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Low Stock Alert</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {analysisResults.inventoryStatus.length > 0
                    ? analysisResults.inventoryStatus.filter((item) => item.stock < 10).length
                    : 0}
                </p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Medicines Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Most Prescribed Medicines</h3>
                <div className="h-64">
                  {analysisResults.topMedicines.length > 0 ? (
                    <Bar
                      data={{
                        labels: analysisResults.topMedicines.map((item) => item.name),
                        datasets: [
                          {
                            label: "Prescription Count",
                            data: analysisResults.topMedicines.map((item) => item.count),
                            backgroundColor: [
                              "rgba(75, 192, 192, 0.6)",
                              "rgba(54, 162, 235, 0.6)",
                              "rgba(153, 102, 255, 0.6)",
                              "rgba(255, 159, 64, 0.6)",
                              "rgba(255, 99, 132, 0.6)",
                            ],
                            borderColor: [
                              "rgba(75, 192, 192, 1)",
                              "rgba(54, 162, 235, 1)",
                              "rgba(153, 102, 255, 1)",
                              "rgba(255, 159, 64, 1)",
                              "rgba(255, 99, 132, 1)",
                            ],
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                        },
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No medicine data available
                    </div>
                  )}
                </div>
              </div>

              {/* Monthly Sales Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Monthly Sales Trend</h3>
                <div className="h-64">
                  {analysisResults.monthlySales.length > 0 ? (
                    <Line
                      data={{
                        labels: analysisResults.monthlySales.map((item) => item.month),
                        datasets: [
                          {
                            label: `Monthly Sales (${currency})`,
                            data: analysisResults.monthlySales.map((item) => item.amount),
                            fill: false,
                            backgroundColor: "rgba(54, 162, 235, 0.6)",
                            borderColor: "rgba(54, 162, 235, 1)",
                            tension: 0.1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">No sales data available</div>
                  )}
                </div>
              </div>

              {/* Inventory Status Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Low Stock Inventory</h3>
                <div className="h-64">
                  {analysisResults.inventoryStatus.length > 0 ? (
                    <Bar
                      data={{
                        labels: analysisResults.inventoryStatus.map((item) => item.name),
                        datasets: [
                          {
                            label: "Stock Level",
                            data: analysisResults.inventoryStatus.map((item) => item.stock),
                            backgroundColor: "rgba(255, 99, 132, 0.6)",
                            borderColor: "rgba(255, 99, 132, 1)",
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: "y",
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No inventory data available
                    </div>
                  )}
                </div>
              </div>

              {/* Doctor Patterns Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Doctor Prescription Patterns</h3>
                <div className="h-64">
                  {analysisResults.doctorPatterns.length > 0 ? (
                    <Pie
                      data={{
                        labels: analysisResults.doctorPatterns.map((item) => item.name),
                        datasets: [
                          {
                            data: analysisResults.doctorPatterns.map((item) => item.count),
                            backgroundColor: [
                              "rgba(54, 162, 235, 0.6)",
                              "rgba(255, 99, 132, 0.6)",
                              "rgba(255, 206, 86, 0.6)",
                              "rgba(75, 192, 192, 0.6)",
                              "rgba(153, 102, 255, 0.6)",
                            ],
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No doctor data available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Insights Tab */}
        {parsedData && !isLoading && activeTab === "ai-insights" && renderAiInsightsTab()}

        {/* Inventory Tab */}
        {parsedData && !isLoading && activeTab === "inventory" && renderInventoryTab()}

        {/* Prescriptions Tab */}
        {parsedData && !isLoading && activeTab === "prescriptions" && renderPrescriptionsTab()}

        {/* Sales Tab */}
        {parsedData && !isLoading && activeTab === "sales" && renderSalesTab()}

        {/* Patients Tab */}
        {parsedData && !isLoading && activeTab === "patients" && renderPatientsTab()}
      </div>
    </div>
  );
};

export default MedicalDataDashboard;