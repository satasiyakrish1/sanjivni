/**
 * Analyzes medical data and extracts insights
 * @param {Array} data - The parsed data from uploaded file
 * @returns {Object} Analysis results including top medicines, monthly sales, inventory status, and doctor patterns
 */
export const analyzeData = (data) => {
  if (!data || data.length === 0) {
    return {
      topMedicines: [],
      monthlySales: [],
      inventoryStatus: [],
      doctorPatterns: []
    };
  }

  try {
    // 1. Top Medicines Analysis
    const medicineCount = {};
    data.forEach(item => {
      const medicineName = item.medicine_name || item.medicineName || item.medicine;
      if (medicineName) {
        medicineCount[medicineName] = (medicineCount[medicineName] || 0) + 1;
      }
    });
    
    const topMedicines = Object.entries(medicineCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // 2. Monthly Sales Analysis
    const monthlySales = {};
    data.forEach(item => {
      const date = item.date || item.purchaseDate || item.sale_date;
      if (date) {
        const month = new Date(date).toLocaleString('default', { month: 'short' });
        const amount = parseFloat(item.amount || item.price || item.total || 0);
        monthlySales[month] = (monthlySales[month] || 0) + amount;
      }
    });

    // 3. Inventory Status
    const inventory = {};
    data.forEach(item => {
      const medicineName = item.medicine_name || item.medicineName || item.medicine;
      const stock = parseInt(item.stock || item.quantity || item.inventory || 0);
      if (medicineName && !isNaN(stock)) {
        inventory[medicineName] = stock;
      }
    });

    const inventoryStatus = Object.entries(inventory)
      .sort((a, b) => a[1] - b[1]) // Sort by stock level (ascending)
      .slice(0, 5) // Get the 5 lowest stock items
      .map(([name, stock]) => ({ name, stock }));

    // 4. Doctor/Customer Patterns
    const doctorPatterns = {};
    data.forEach(item => {
      const doctor = item.doctor || item.doctor_name || item.prescribedBy;
      if (doctor) {
        doctorPatterns[doctor] = (doctorPatterns[doctor] || 0) + 1;
      }
    });

    const doctorData = Object.entries(doctorPatterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      topMedicines,
      monthlySales: Object.entries(monthlySales).map(([month, amount]) => ({ month, amount })),
      inventoryStatus,
      doctorPatterns: doctorData
    };

  } catch (error) {
    console.error('Error analyzing data:', error);
    return {
      topMedicines: [],
      monthlySales: [],
      inventoryStatus: [],
      doctorPatterns: []
    };
  }
};

/**
 * Parses file data based on file type
 * @param {File} file - The uploaded file
 * @param {Function} Papa - PapaParse library instance
 * @param {Object} XLSX - SheetJS library instance
 * @returns {Promise<Array>} Parsed data as array of objects
 */
export const parseFile = async (file, Papa, XLSX) => {
  const fileType = file.name.split('.').pop().toLowerCase();
  let data;

  if (fileType === 'csv') {
    // Parse CSV
    data = await new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        complete: (results) => resolve(results.data)
      });
    });
  } else if (fileType === 'xlsx') {
    // Parse Excel
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    data = XLSX.utils.sheet_to_json(worksheet);
  } else if (fileType === 'json') {
    // Parse JSON
    const text = await file.text();
    data = JSON.parse(text);
  }

  return data;
};