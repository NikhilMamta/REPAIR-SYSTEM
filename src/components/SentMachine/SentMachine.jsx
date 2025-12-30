import React, { useEffect, useState } from "react";
import { Search, Filter, Send, Loader2Icon } from "lucide-react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/Table";
import { mockRepairTasks } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";

const SentMachine = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [historyTasks, setHistoryTasks] = useState([]);
  const [loaderSubmit, setLoaderSubmit] = useState(false);
  const [formData, setFormData] = useState({
    vendorName: "",
    transporterName: "",
    transportationCharges: "",
    weighmentSlip: "",
    transportingImage: "",
    leadTimeToDeliver: "",
    paymentType: "",
    advancePayment: "",
  });
  const [vendorData, setVendorData] = useState([]);
  const [loaderMasterSheetData, setLoaderMasterSheetData] = useState(false);

  const filteredTasks = tasks.filter(
    (task) => user?.role === "admin" || task.nameOfIndenter === user?.name
  );

  const handleSentClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const [loadingTasks, setLoadingTasks] = useState(false);

  // console.log("selectedTask.taskNo", selectedTask?.taskNo);
  // console.log("tasks", tasks);
  const [searchTerm, setSearchTerm] = useState("");

  // const filteredTasks = tasks.length > 0 && tasks
  //   .filter(
  //     (task) => user?.role === "admin" || task.nameOfIndenter === user?.name
  //   )
  //   .filter(
  //     (task) =>
  //       task.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       task.taskNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       task.serialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       task.doerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       task.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       task.machinePartName.toLowerCase().includes(searchTerm.toLowerCase())
  //   );

  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbw_906PqOc36llVEHDqBd7bjm4Nj-Xv8VtTG-ODKld2wz4oA_-DL9J6WyD2Ur3mFbfHrw/exec";
  const SHEET_Id = "1wCjPAiyA1XKOSr4Q-VLjttIocU_eI1ZbbsKzEGt6lks";
  const FOLDER_ID = "1IcQijNpCDjOI_HcMMeAiQHIbxO8pwmGZ";

  // Data fetching constants (matching IndentForm)
  const DATA_FETCH_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz-wbRJYrSa2Fis-nYI0tivRS2Ns6rcXkGc18Wsib6P5Psea0ai8kJ_zPOSHP-oRU6J/exec";
  const DATA_SHEET_ID = "16Hj4fUNqGaq6NnQlkFAXejfrA9NgpWAl3odmNW4SGcA";

  const fetchAllTasks = async () => {
    // console.log("selectedTaskType", selectedTaskType);
    try {
      setLoadingTasks(true);
      const SHEET_NAME_TASK = "Repair System";

      const res = await fetch(
        `${SCRIPT_URL}?sheetId=${SHEET_Id}&&sheet=${SHEET_NAME_TASK}`
      );
      const result = await res.json();

      const allRows = result?.table?.rows || [];

      // Skip first 5 rows (index 0 to 4)
      const taskRows = allRows.slice(5);

      const formattedTasks = taskRows.map((row) => {
        const cells = row.c;

        return {
          timestamp: cells[0]?.v || "",
          taskNo: cells[1]?.v || "",
          serialNo: cells[2]?.v || "",
          machineName: cells[3]?.v || "",
          machinePartName: cells[4]?.v || "",
          givenBy: cells[5]?.v || "",
          doerName: cells[6]?.v || "",
          problem: cells[7]?.v || "",
          enableReminder: cells[8]?.v || "",
          requireAttachment: cells[9]?.v || "",
          taskStartDate: cells[10]?.v || "",
          taskEndDate: cells[11]?.v || "",
          priority: cells[12]?.v || "",
          department: cells[13]?.v || "",
          location: cells[14]?.v || "",
          imageUrl: cells[15]?.v || "",
          planned: cells[16]?.v || "",
          actual: cells[17]?.v || "",
          delay: cells[18]?.v || "",

          vendorName: cells[19]?.v || "",
          leadTimeToDeliverDays: cells[20]?.v || "",
          transporterName: cells[21]?.v || "",
          transportationCharges: cells[22]?.v || "",
          weighmentSlip: cells[23]?.v || "",
          transportingImageWithMachine: cells[24]?.v || "",
          paymentType: cells[25]?.v || "",
          howMuch: cells[26]?.v || "",
        };
      });

      // console.log("Formatted Tasks:", formattedTasks);
      setTasks(formattedTasks);

      // Set pending tasks

      const pendingTasks = formattedTasks.filter((task) => task.actual === "");
      setPendingTasks(pendingTasks);

      // Set history tasks
      const historyTasks = formattedTasks.filter(
        (task) => task.actual !== "" && task.planned !== ""
      );
      setHistoryTasks(historyTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchMasterSheetData = async () => {
    const SHEET_NAME = "Machines";
    try {
      setLoaderMasterSheetData(true);
      const url = `${DATA_FETCH_SCRIPT_URL}?sheetId=${DATA_SHEET_ID}&sheet=${SHEET_NAME}`;

      const res = await fetch(url);
      const result = await res.json();

      if (result.success && result.data) {
        const headers = result.data[0];
        const rows = result.data.slice(1);

        const formattedRows = rows.map((row) => {
          const rowData = {};
          headers.forEach((header, colIndex) => {
            const cleanHeader = header ? header.trim() : `Column_${colIndex}`;
            rowData[cleanHeader] = row[colIndex] || "";
          });
          return rowData;
        });

        const allVendors = [];
        formattedRows.forEach((item) => {
          const vendorValue = item["Vendor Name"] || item["Add Vendor Name"] || "";
          if (vendorValue && vendorValue.trim() !== "") {
            allVendors.push(vendorValue.trim());
          }
        });

        setVendorData([...new Set(allVendors)].sort());
      }
    } catch (err) {
      console.error("Fetch error for Vendors:", err);
    } finally {
      setLoaderMasterSheetData(false);
    }
  };

  useEffect(() => {
    fetchAllTasks();
    fetchMasterSheetData();
  }, []);

  const uploadFileToDrive = async (file) => {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        const base64Data = reader.result;

        // console.log("base64Data", base64Data);
        // console.log("file.name", file.name);
        // console.log("file.type", file.type);
        // console.log("FOLDER_ID", FOLDER_ID);

        try {
          const res = await fetch(SCRIPT_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              action: "uploadFile",
              base64Data: base64Data,
              fileName: file.name,
              mimeType: file.type,
              folderId: FOLDER_ID,
            }).toString(),
          });

          const data = await res.json();

          console.log("FileUploadData", data);

          if (data.success && data.fileUrl) {
            resolve(data.fileUrl);
          } else {
            toast.error("❌ File upload failed");
            resolve("");
          }
        } catch (err) {
          console.error("Upload error:", err);
          toast.error("❌ Upload failed due to network error");
          resolve("");
        }
      };

      reader.onerror = () => {
        reject("❌ Failed to read file");
      };

      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(
      "form",
      formData.paymentType === "Advance" ? formData.advancePayment : "6"
    );
    try {
      let imageUrl = "";
      setLoaderSubmit(true);
      if (formData.transportingImage) {
        imageUrl = await uploadFileToDrive(formData.transportingImage);
      }

      const payload = {
        action: "update1",
        sheetName: "Repair System",
        taskNo: selectedTask.taskNo,

        Actual: new Date().toLocaleString("en-GB", {
          timeZone: "Asia/Kolkata",
        }),

        // 👇 header जैसा ही key लिखो ("Actual 1")
        "Actual 1": new Date().toLocaleDateString("en-GB", {
          timeZone: "Asia/Kolkata",
        }),

        "Vendor Name": formData.vendorName,
        "(Transporter Name)": formData.transporterName,
        "Transportation Charges": formData.transportationCharges,
        "Weighment Slip": formData.weighmentSlip,
        "Transporting Image With Machine": imageUrl,
        "Lead Time To Deliver ( In No. Of Days)": formData.leadTimeToDeliver,
        "Payment Type": formData.paymentType,
        "How Much": formData.paymentType === "Advance" ? formData.advancePayment : "",
      };
      console.log("payload", payload);

      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(payload).toString(),
      });

      const result = await response.json();
      console.log("Update result:", result);

      if (result.success) {
        alert("✅ Task updated successfully");
        setIsModalOpen(false);
        fetchAllTasks(); // refresh the table
      } else {
        alert("❌ Failed to update task: " + result.message);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("❌ Something went wrong while submitting");
    } finally {
      setLoaderSubmit(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  console.log("history", historyTasks);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Sent Machine</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${activeTab === "pending"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              Pending ({pendingTasks.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${activeTab === "history"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              History ({historyTasks.length})
            </button>
          </nav>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button variant="secondary" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {activeTab === "pending" && (
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-250px)]">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Task Number</TableHead>
                  <TableHead>Planned Date</TableHead>
                  <TableHead>Machine Name</TableHead>
                  <TableHead>Serial No</TableHead>
                  <TableHead>Indenter</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Part Name</TableHead>
                  <TableHead>Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTasks.map((task) => (
                  <TableRow key={task.taskNo}>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleSentClick(task)}
                        className="flex items-center"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Sent
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium text-blue-600">
                      {task.taskNo}
                    </TableCell>
                    <TableCell>
                      {new Date(task.taskStartDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{task.machineName}</TableCell>
                    <TableCell>{task.serialNo}</TableCell>
                    <TableCell>{task.doerName}</TableCell>
                    <TableCell>{task.department}</TableCell>
                    <TableCell>{task.machinePartName}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {loadingTasks && (
              <div className="flex flex-col items-center justify-center w-[75vw] mt-10">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Loading tasks...</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-250px)]">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow>
                  <TableHead>Task Number</TableHead>
                  <TableHead>Planned Date</TableHead>
                  <TableHead>Serial No</TableHead>
                  <TableHead>Machine Name</TableHead>
                  <TableHead>Indenter</TableHead>
                  {/* to do */}

                  <TableHead>Part Name</TableHead>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Lead Time</TableHead>
                  <TableHead>Transpoter Name</TableHead>
                  <TableHead>Transportation Charges</TableHead>
                  <TableHead>Weighment Slip</TableHead>
                  <TableHead>Transporting Image With Machine</TableHead>
                  <TableHead>Payment Type</TableHead>
                  <TableHead>How Much</TableHead>

                  <TableHead>Part Name</TableHead>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Transporter</TableHead>
                  <TableHead>Transportation Charges</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyTasks.map((task) => (
                  <TableRow key={task.taskNo}>
                    <TableCell className="font-medium text-blue-600">
                      {task.taskNo}
                    </TableCell>
                    <TableCell>
                      {new Date(task.taskStartDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{task.serialNo}</TableCell>
                    <TableCell>{task.machineName}</TableCell>
                    <TableCell>{task.doerName}</TableCell>
                    {/* to do */}

                    <TableCell>{task.department}</TableCell>
                    <TableCell>{task.vendorName}</TableCell>
                    <TableCell>{task.leadTimeToDeliverDays}</TableCell>
                    <TableCell>{task.transporterName}</TableCell>
                    <TableCell>{task.transportationCharges}</TableCell>
                    <TableCell>{task.weighmentSlip}</TableCell>
                    <TableCell>
                      {task.transportingImageWithMachine ? (
                        <Button
                          size="sm"
                          variant="primary"

                          onClick={() =>
                            window.open(
                              task.transportingImageWithMachine,
                              "_blank"
                            )
                          }
                        >
                          View
                        </Button>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{task.paymentType}</TableCell>
                    <TableCell>{task.howMuch}</TableCell>

                    <TableCell>{task.machinePartName}</TableCell>
                    <TableCell>{task.vendorName || "-"}</TableCell>
                    <TableCell>{task.transporterName || "-"}</TableCell>
                    <TableCell>
                      ₹{task.transportationCharges?.toLocaleString() || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {loadingTasks && (
              <div className="flex flex-col items-center justify-center w-[75vw] mt-10">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Loading tasks...</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Send Machine to Vendor"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repair Task Number (Read-only)
              </label>
              <input
                type="text"
                value={selectedTask?.taskNo || ""}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Machine Name (Read-only)
              </label>
              <input
                type="text"
                value={selectedTask?.machineName || ""}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name *
              </label>
              <select
                value={formData.vendorName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    vendorName: e.target.value,
                  }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Vendor</option>
                {loaderMasterSheetData ? (
                  <option disabled>Loading vendors...</option>
                ) : (
                  vendorData.map((vendor, index) => (
                    <option key={index} value={vendor}>
                      {vendor}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transporter Name
              </label>
              <input
                type="text"
                value={formData.transporterName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    transporterName: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transportation Charges
              </label>
              <input
                type="number"
                value={formData.transportationCharges}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    transportationCharges: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weighment Slip
              </label>
              <input
                type="text"
                value={formData.weighmentSlip}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    weighmentSlip: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lead Time To Deliver ( In No. Of Days)
            </label>
            <input
              type="number"
              value={formData.leadTimeToDeliver}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  leadTimeToDeliver: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transporting Image With Machine
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  transportingImage: e.target.files[0],
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Add Payment Type dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Type *
            </label>
            <select
              value={formData.paymentType || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  paymentType: e.target.value,
                }))
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Payment Type</option>
              <option value="Advance">Advance</option>
              <option value="Full">Full</option>
              <option value="Warrenty/Garentie">Warrenty/Garentie</option>
            </select>
          </div>

          {/* Conditionally render Advance Payment input */}
          {formData.paymentType === "Advance" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Advance Payment Amount *
              </label>
              <input
                type="number"
                value={formData.advancePayment || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    advancePayment: e.target.value,
                  }))
                }
                required={formData.paymentType === "Advance"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {loaderSubmit && <Loader2Icon className="animate-spin" />}
              Submit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SentMachine;
