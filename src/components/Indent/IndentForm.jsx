import React, { useEffect, useState, useRef } from "react";
import { Plus, X, Upload, Loader2Icon } from "lucide-react";
import Button from "../ui/Button";
import toast from "react-hot-toast";

const IndentForm = ({ onSubmit, onCancel, taskList }) => {
  // Data states
  const [sheetData, setSheetData] = useState([]);
  const [masterRecords, setMasterRecords] = useState([]);
  const [doerName, setDoerName] = useState([]);
  const [giveByData, setGivenByData] = useState([]);
  const [taskStatusData, setTaskStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [wardsData, setWardsData] = useState([]);

  // Form field states
  const [selectedMachine, setSelectedMachine] = useState("");
  const [filteredSerials, setFilteredSerials] = useState([]);
  const [filteredDepartment, setFilteredDepartment] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [userManualFile, setUserManualFile] = useState(null);
  const [machinePartName, setMachinePartName] = useState("");

  // Date and time states - End date/time are empty by default
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTaskDate, setEndTaskDate] = useState("");
  const [availableFrequencies, setAvailableFrequencies] = useState([]);

  // Other form states
  const [selectedSerialNo, setSelectedSerialNo] = useState("");
  const [selectedGivenBy, setSelectedGivenBy] = useState("");
  const [selectedDoerName, setSelectedDoerName] = useState("");
  const [selectedTaskType, setSelectedTaskType] = useState("Select Task Type");
  const [needSoundTask, setNeedSoundTask] = useState("");
  const [temperature, setTemperature] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [description, setPromblemInMachine] = useState("");
  const [machineArea, setMachineArea] = useState("");
  const [partName, setPartName] = useState("");

  // Loading states
  const [loaderSheetData, setLoaderSheetData] = useState(false);
  const [loaderSubmit, setLoaderSubmit] = useState(false);
  const [loaderMasterSheetData, setLoaderMasterSheetData] = useState(false);


  // Timer reference for updating time (only for start time)
  const timeUpdateRef = useRef(null);

  // API URLs
  const DATA_FETCH_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz-wbRJYrSa2Fis-nYI0tivRS2Ns6rcXkGc18Wsib6P5Psea0ai8kJ_zPOSHP-oRU6J/exec";
  const DATA_SHEET_ID = "16Hj4fUNqGaq6NnQlkFAXejfrA9NgpWAl3odmNW4SGcA";

  // Function to get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Function to get current time in HH:MM format
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const fetchSheetData = async () => {
    const SHEET_NAME = "FormResponses";
    try {
      setLoaderSheetData(true);
      const url = `${DATA_FETCH_SCRIPT_URL}?sheetId=${DATA_SHEET_ID}&sheet=${SHEET_NAME}`;
      console.log("Fetching FormResponses from:", url);

      const res = await fetch(url);
      const result = await res.json();

      console.log("FormResponses raw response:", result);

      if (result.success && result.data) {
        const headers = result.data[0];
        const rows = result.data.slice(1);

        const formattedRows = rows.map((row) => {
          const rowData = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index] || "";
          });
          return rowData;
        });

        setSheetData(formattedRows);
        console.log(`FormResponses: ${formattedRows.length} records loaded`);
      } else {
        console.error("Server error for FormResponses:", result.message || result.error || "Unknown error");
      }
    } catch (err) {
      console.error("FormResponses fetch error:", err);
      toast.error("Failed to load FormResponses data");
    } finally {
      setLoaderSheetData(false);
    }
  };

  const fetchMasterSheetData = async () => {
    const SHEET_NAME = "Machines";
    console.log("Google Sheet name = 'Machines'");

    try {
      setLoaderMasterSheetData(true);
      const url = `${DATA_FETCH_SCRIPT_URL}?sheetId=${DATA_SHEET_ID}&sheet=${SHEET_NAME}`;

      const res = await fetch(url);
      const result = await res.json();

      console.log("Machines sheet raw response:", result);

      if (result.success && result.data) {
        const headers = result.data[0];
        const rows = result.data.slice(1);

        console.log("Headers:", headers);
        console.log("Total rows:", rows.length);

        const formattedRows = rows.map((row, rowIndex) => {
          const rowData = {};
          headers.forEach((header, colIndex) => {
            const cleanHeader = header ? header.trim() : `Column_${colIndex}`;
            rowData[cleanHeader] = row[colIndex] || "";
          });
          return rowData;
        }).filter((row) => {
          return Object.values(row).some((value) => value && value.toString().trim() !== "");
        });

        setMasterRecords(formattedRows);
        console.log(`Processed ${formattedRows.length} valid records`);

        // Extract data for dropdowns
        const allDoers = [];
        const allDepartments = [];
        const allWards = [];

        formattedRows.forEach((item) => {
          // Extract Doer Name (check multiple possible column names)
          const doerValue = item["Doers Name"] || item["Doer Name"] || item["Doer"] || "";
          if (doerValue && doerValue.trim() !== "") {
            allDoers.push(doerValue.trim());
          }

          // Extract Department
          const deptValue = item["Department"] || item["Dept"] || "";
          if (deptValue && deptValue.trim() !== "") {
            allDepartments.push(deptValue.trim());
          }

          // Extract Wards
          const wardValue = item["Wards"] || item["Ward"] || item["Add Wards"] || "";
          if (wardValue && wardValue.trim() !== "") {
            allWards.push(wardValue.trim());
          }
        });

        // Remove duplicates and set states
        setDoerName([...new Set(allDoers)]);
        setDepartmentData([...new Set(allDepartments)]);
        setWardsData([...new Set(allWards)].sort());

        console.log("Extracted data:", {
          doers: [...new Set(allDoers)],
          departments: [...new Set(allDepartments)],
          wards: [...new Set(allWards)].sort()
        });

      } else {
        console.error("Server returned error:", result.message || result.error || "Unknown error");
        toast.error("Failed to fetch Machines data");
      }
    } catch (err) {
      console.error("Fetch error for Machines:", err);
      toast.error("Failed to connect to server");
    } finally {
      setLoaderMasterSheetData(false);
    }
  };

  useEffect(() => {
    console.log("Component mounted, fetching data...");

    // Set ONLY start date and time (current date/time)
    // End date/time remain empty for user to set
    const currentDate = getCurrentDate();
    const currentTime = getCurrentTime();

    setStartDate(currentDate);
    setStartTime(currentTime);
    // End date/time are NOT set by default
    // setEndTaskDate(""); // Already empty by default
    // setEndTime(""); // Already empty by default

    // Set up timer to update START time only every minute
    timeUpdateRef.current = setInterval(() => {
      const updatedTime = getCurrentTime();
      // Only update start time if user hasn't changed it
      setStartTime(prev => {
        // If start time is still at the current time (i.e., hasn't been manually changed)
        const currentTime = getCurrentTime();
        if (prev === currentTime) {
          return updatedTime;
        }
        return prev; // Keep user's manual change
      });
    }, 60000);

    fetchSheetData();
    fetchMasterSheetData();

    // Cleanup timer on unmount
    return () => {
      if (timeUpdateRef.current) {
        clearInterval(timeUpdateRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffInDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

      let frequencies = [];
      if (diffInDays >= 365) {
        frequencies = [
          "one-time",
          "Daily",
          "Weekly",
          "Monthly",
          "Quarterly",
          "Half Yearly",
          "Yearly",
        ];
      } else if (diffInDays >= 180) {
        frequencies = [
          "one-time",
          "Daily",
          "Weekly",
          "Monthly",
          "Quarterly",
          "Half Yearly",
        ];
      } else if (diffInDays >= 90) {
        frequencies = ["one-time", "Daily", "Weekly", "Monthly", "Quarterly"];
      } else if (diffInDays >= 30) {
        frequencies = ["one-time", "Daily", "Weekly", "Monthly"];
      } else if (diffInDays >= 7) {
        frequencies = ["one-time", "Daily", "Weekly"];
      } else if (diffInDays > 0) {
        frequencies = ["one-time", "Daily"];
      }

      setAvailableFrequencies(frequencies);
    } else {
      setAvailableFrequencies([]);
    }
  }, [startDate, endDate]);

  const uploadFileToDrive = async (file) => {
    return new Promise((resolve) => {
      // Simulated file upload
      setTimeout(() => {
        console.log("File upload simulated:", file.name);
        resolve(`https://example.com/uploads/${Date.now()}_${file.name}`);
      }, 1000);
    });
  };

  const clearFormState = () => {
    setSelectedSerialNo("");
    setSelectedMachine("");
    setSelectedGivenBy("");
    setSelectedDoerName("");
    setSelectedTaskType("Select Task Type");
    setStartDate(getCurrentDate());
    setStartTime(getCurrentTime());
    setEndDate("");
    setEndTaskDate("");
    setEndTime("");
    setPromblemInMachine("");
    setSelectedPriority("");
    setMachinePartName("");
    setSelectedWard("");
    setSelectedDepartment("");
    setMachineArea("");
    setPartName("");
    setNeedSoundTask("");
    setTemperature("");

    setUserManualFile(null);
    setFilteredSerials([]);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    // Basic validation - end date/time are optional
    if (!selectedMachine || !selectedDoerName || !selectedWard) {
      toast.error("❌ Please fill in all required fields");
      return;
    }

    // Optional: Validate that end date/time are not before start date/time
    if (endTaskDate && startDate) {
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endTaskDate}T${endTime}`);

      if (end < start) {
        toast.error("❌ End date/time cannot be before start date/time");
        return;
      }
    }

    try {
      setLoaderSubmit(true);

      // Upload file if exists
      let userManualUrl = "";
      if (userManualFile) {
        userManualUrl = await uploadFileToDrive(userManualFile);
      }

      // Prepare task data - end date/time are optional
      const taskData = {
        "Time Stamp": new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        "Serial No": selectedSerialNo || "N/A",
        "Machine Name": selectedMachine,
        "Given By": selectedGivenBy || "N/A",
        "Doer Name": selectedDoerName,
        "Enable Reminders": "No",
        "Require Attachment": "No",
        "Task Start Date": startDate && startTime ? `${startDate} ${startTime}:00` : "",
        "Task Ending Date": endTaskDate && endTime ? `${endTaskDate} ${endTime}:00` : "Not specified",
        "Problem With Machine": description,
        Department: selectedDepartment,
        "Ward": selectedWard,
        "Machine Part Name": machinePartName,
        "Image Link": userManualUrl || "link not available",
        Priority: selectedPriority || "Medium",
      };

      console.log("Submitting task data:", taskData);

      // Simulate API submission
      setTimeout(() => {
        toast.success("✅ Task assigned successfully!");
        clearFormState();
        if (onSubmit) onSubmit();
        onCancel();
      }, 1500);

    } catch (error) {
      console.error("❌ Submission failed:", error);
      toast.error("❌ Something went wrong during submission.");
    } finally {
      setLoaderSubmit(false);
    }
  };

  // Get unique machine names from masterRecords
  const getUniqueMachineNames = () => {
    if (masterRecords.length === 0) return [];

    const machineNames = [];
    masterRecords.forEach((item) => {
      // Try to find machine name in various possible columns
      const possibleKeys = ["Machine Name", "Machine", "Name", "Equipment Name"];
      for (const key of possibleKeys) {
        if (item[key] && item[key].trim() !== "") {
          machineNames.push(item[key].trim());
          break;
        }
      }
    });

    return [...new Set(machineNames)].sort();
  };

  // Handle date/time reset buttons - only for start date/time
  const handleSetToday = (field) => {
    const today = getCurrentDate();
    if (field === 'start') {
      setStartDate(today);
    } else {
      // For end date, just set to empty or today? Let's set to today
      setEndTaskDate(today);
    }
  };

  const handleSetNow = (field) => {
    const now = getCurrentTime();
    if (field === 'start') {
      setStartTime(now);
    } else {
      // For end time, just set to empty or now? Let's set to now
      setEndTime(now);
    }
  };

  // Handle clearing end date/time
  const handleClearEndDateTime = () => {
    setEndTaskDate("");
    setEndTime("");
  };

  return (
    <form onSubmit={handleSubmitForm} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Machine Name Dropdown */}
        <div>
          <label
            htmlFor="machineName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Machine Name *
          </label>
          <select
            id="machineName"
            value={selectedMachine}
            onChange={(e) => {
              const selected = e.target.value;
              setSelectedMachine(selected);
              // Filter serials based on selected machine
              const serials = masterRecords
                .filter((item) => {
                  const machineNameKey = Object.keys(item).find(key =>
                    key.toLowerCase().includes("machine") || key.toLowerCase().includes("name")
                  );
                  return item[machineNameKey] === selected;
                })
                .map((item) => item["Serial No"] || "N/A");
              setFilteredSerials([...new Set(serials.filter(Boolean))]);
            }}
            className="w-full py-2 rounded-md border border-gray-300 shadow-sm px-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Machine</option>
            {loaderMasterSheetData ? (
              <option disabled className="flex gap-5 items-center justify-center">
                <Loader2Icon className="animate-spin text-red-500" />
                <h1>Loading machines...</h1>
              </option>
            ) : (
              getUniqueMachineNames().map((machineName, index) => (
                <option key={index} value={machineName}>
                  {machineName}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Serial No Dropdown */}
        {selectedMachine && filteredSerials.length > 0 && (
          <div>
            <label
              htmlFor="serialNo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Serial Number
            </label>
            <select
              id="serialNo"
              value={selectedSerialNo}
              onChange={(e) => setSelectedSerialNo(e.target.value)}
              className="py-2 w-full rounded-md border border-gray-300 shadow-sm px-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Serial No (Optional)</option>
              {filteredSerials.map((serial, idx) => (
                <option key={idx} value={serial}>
                  {serial}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Doer's Name */}
        <div>
          <label
            htmlFor="doerName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Doer's Name *
          </label>
          <select
            id="doerName"
            value={selectedDoerName}
            onChange={(e) => setSelectedDoerName(e.target.value)}
            className="py-2 rounded-md w-full border border-gray-300 shadow-sm px-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Doer Name</option>
            {loaderMasterSheetData ? (
              <option disabled className="flex gap-5 items-center justify-center">
                <Loader2Icon className="animate-spin text-red-500" />
                <h1>Loading doers...</h1>
              </option>
            ) : (
              doerName.map((item, index) => (
                item && (
                  <option key={index} value={item}>
                    {item}
                  </option>
                )
              ))
            )}
          </select>
        </div>

        {/* Department */}
        <div>
          <label
            htmlFor="department"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Department
          </label>
          <select
            id="department"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="py-2 w-full rounded-md border border-gray-300 shadow-sm px-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Department</option>
            {loaderMasterSheetData ? (
              <option disabled className="flex gap-5 items-center justify-center">
                <Loader2Icon className="animate-spin text-red-500" />
                <h1>Loading departments...</h1>
              </option>
            ) : (
              departmentData.map((item, index) => (
                item && (
                  <option key={index} value={item}>
                    {item}
                  </option>
                )
              ))
            )}
          </select>
        </div>

        {/* Ward Selection */}
        <div>
          <label
            htmlFor="ward"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ward *
          </label>
          <select
            id="ward"
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select Ward</option>
            {loaderMasterSheetData ? (
              <option disabled className="flex gap-2 items-center justify-center">
                <Loader2Icon className="animate-spin text-red-500 h-4 w-4" />
                <span>Loading wards...</span>
              </option>
            ) : (
              wardsData.map((ward, index) => (
                <option key={index} value={ward}>
                  {ward}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Machine Part Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Machine Part Name
          </label>
          <input
            type="text"
            name="machinePartName"
            value={machinePartName}
            onChange={(e) => setMachinePartName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter machine part name"
          />
        </div>

        {/* Priority */}
        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Priority
          </label>
          <select
            id="priority"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700"
          >
            Task Start Date *
          </label>
          <div className="mt-1 relative">
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              required
            />
            <button
              type="button"
              onClick={() => handleSetToday('start')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
              title="Set to today"
            >
              Today
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Defaults to current date</p>
        </div>

        {/* Task Start Time */}
        <div>
          <label
            htmlFor="startTime"
            className="block text-sm font-medium text-gray-700"
          >
            Task Start Time *
          </label>
          <div className="mt-1 relative">
            <input
              type="time"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              required
            />
            <button
              type="button"
              onClick={() => handleSetNow('start')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
              title="Set to current time"
            >
              Now
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Auto-updates every minute</p>
        </div>

        {/* End Date - Optional */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="endTaskDate"
              className="block text-sm font-medium text-gray-700"
            >
              Task End Date (Optional)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSetToday('end')}
                className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                title="Set to today"
              >
                Today
              </button>
              {endTaskDate && (
                <button
                  type="button"
                  onClick={handleClearEndDateTime}
                  className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                  title="Clear end date"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <input
              type="date"
              id="endTaskDate"
              value={endTaskDate}
              onChange={(e) => setEndTaskDate(e.target.value)}
              min={startDate}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 cursor-pointer"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Leave empty if not applicable</p>
        </div>

        {/* Task End Time - Optional */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="endTime"
              className="block text-sm font-medium text-gray-700"
            >
              Task End Time (Optional)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSetNow('end')}
                className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                title="Set to current time"
              >
                Now
              </button>
              {endTime && (
                <button
                  type="button"
                  onClick={() => setEndTime("")}
                  className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                  title="Clear end time"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <input
              type="time"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 cursor-pointer"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Leave empty if not applicable</p>
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Problem With Machine
        </label>
        <textarea
          id="description"
          onChange={(e) => setPromblemInMachine(e.target.value)}
          value={description}
          rows={4}
          className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe the problem with the machine..."
        />
      </div>

      {/* Upload Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image of the Machine (Optional)
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors duration-200">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                <span>Upload a file</span>
                <input
                  type="file"
                  name="imageOfTheMachine"
                  onChange={(e) => {
                    const file = e.target.files ? e.target.files[0] : null;
                    if (file && file.size > 10 * 1024 * 1024) {
                      toast.error("File size must be less than 10MB");
                      return;
                    }
                    setUserManualFile(file);
                  }}
                  className="sr-only"
                  accept="image/*"
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            {userManualFile && (
              <p className="text-sm text-green-600 mt-2">
                Selected: {userManualFile.name}
              </p>
            )}
          </div>
        </div>
      </div>



      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={loaderSubmit}>
          {loaderSubmit && <Loader2Icon className="animate-spin mr-2" />}
          {loaderSubmit ? "Saving..." : "Save Indent"}
        </Button>
      </div>
    </form>
  );
};

export default IndentForm;