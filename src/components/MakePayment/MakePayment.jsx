import React, { useEffect, useState } from "react";
import { Search, Filter, Package } from "lucide-react";
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
import { useAuth } from "../../context/AuthContext";
import useDataStore from "../../store/dataStore";
import toast from "react-hot-toast";

const MakePayment = () => {
  const { user } = useAuth();
  const {
    repairPayments,
    pendingRepairPayments,
    historyRepairPayments,
    setRepairPayments,
    setPendingRepairPayments,
    setHistoryRepairPayments,
    addRepairPayment
  } = useDataStore();

  const [activeTab, setActiveTab] = useState("pending");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    totalBillAmount: "",
    paymentType: "",
    toBePaidAmount: "",
  });

  // State for hover preview
  const [hoveredDoc, setHoveredDoc] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // const filteredTasks = tasks.filter(
  //   (task) => user?.role === "admin" || task.nameOfIndenter === user?.name
  // );



  // const pendingTasks = filteredTasks.filter((task) => task.status === "stored");
  // const historyTasks = filteredTasks.filter(
  //   (task) => task.status === "advanced"
  // );

  const handleMaterialClick = (task) => {
    setSelectedTask(task);
    setFormData({
      totalBillAmount: task.totalBillAmount?.toString() || "",
      paymentType: task.paymentType || "",
      toBePaidAmount: task.toBePaidAmount?.toString() || "",
    });
    setIsModalOpen(true);
  };

  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbw_906PqOc36llVEHDqBd7bjm4Nj-Xv8VtTG-ODKld2wz4oA_-DL9J6WyD2Ur3mFbfHrw/exec";
  const SHEET_Id = "1wCjPAiyA1XKOSr4Q-VLjttIocU_eI1ZbbsKzEGt6lks";
  const FOLDER_ID = "1IcQijNpCDjOI_HcMMeAiQHIbxO8pwmGZ";

  const fetchAllTasks = async () => {
    try {
      setLoadingTasks(true);
      const SHEET_NAME_TASK = "Repair System";

      const res = await fetch(
        `${SCRIPT_URL}?sheetId=${SHEET_Id}&&sheet=${SHEET_NAME_TASK}`
      );
      const result = await res.json();

      const allRows = result?.table?.rows || [];
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
          // vendorName: cells[19]?.v || "",
          leadTimeToDeliverDays: cells[20]?.v || "",
          transporterName: cells[21]?.v || "",
          transportationCharges: cells[22]?.v || "",
          weighmentSlip: cells[23]?.v || "",
          transportingImageWithMachine: cells[24]?.v || "",

          vendorName: cells[19]?.v || "",
          leadTimeToDeliverDays: cells[20]?.v || "",
          paymentType: cells[25]?.v || "",
          howMuch: cells[26]?.v || "",
          transportationCharges: cells[22]?.v || "",

          planned1: cells[27]?.v || "",
          actual1: cells[28]?.v || "",
          tranporterName: cells[30]?.v || "",
          billImage: cells[32]?.v || "",
          billNo: cells[33]?.v || "",
          typeOfBill: cells[34]?.v || "",
          totalBillAmount: cells[35]?.v || "",
          toBePaidAmount: cells[36]?.v || "",

          planned2: cells[37]?.v || "",
          actual2: cells[38]?.v || "",
          delay2: cells[39]?.v || "",
          receivedQuantity: cells[40]?.v || "",
          billMatch: cells[41]?.v,
          productImage: cells[42]?.v || "",
          planned4: cells[43]?.v || "",
          actual4: cells[44]?.v || ""
        };
      });

      const pendingTasks = formattedTasks.filter(
        (task) => task.planned4 && !task.actual4
      );
      setPendingRepairPayments(pendingTasks);

    } catch (err) {
      console.error("Error fetching tasks:", err);
      toast.error("Failed to fetch tasks");
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoadingTasks(true);
      const SHEET_NAME_PAYMENTS = "Repair FMS Advance Payment";

      const res = await fetch(
        `${SCRIPT_URL}?sheetId=${SHEET_Id}&&sheet=${SHEET_NAME_PAYMENTS}`
      );
      const result = await res.json();

      const allRows = result?.table?.rows || [];
      const paymentRows = allRows.slice(5);

      const formattedPayments = paymentRows.map((row) => {
        const cells = row.c;
        return {
          timestamp: cells[0]?.v || "",
          paymentNo: cells[1]?.v || "",
          repairTaskNo: cells[2]?.v || "",
          serialNo: cells[3]?.v || "",
          machineName: cells[4]?.v || "",
          vendorName: cells[5]?.v || "",
          billNo: cells[6]?.v || "",
          totalBillAmount: cells[7]?.v || "",
          paymentType: cells[8]?.v || "",
          toBePaidAmount: cells[9]?.v || "",
          // Add any additional columns you need
          // ...
        };
      });

      setRepairPayments(formattedPayments);
      setHistoryRepairPayments(formattedPayments);

    } catch (err) {
      console.error("Error fetching payments:", err);
      toast.error("Failed to fetch payment history");
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchAllTasks();
    fetchPayments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit button clicked");

    if (!selectedTask) return;

    try {
      setSubmitLoading(true);
      const now = new Date();
      const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}, ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

      // Generate payment number
      const lastPaymentNo = repairPayments
        .filter(payment => payment.paymentNo?.startsWith("PN-"))
        .map(payment => parseInt(payment.paymentNo.replace("PN-", ""), 10))
        .filter(num => !isNaN(num))
        .sort((a, b) => b - a)[0] || 0;

      const nextPaymentNo = `PN-${String(lastPaymentNo + 1).padStart(3, "0")}`;

      const newPayment = {
        timestamp: formattedDate,
        paymentNo: nextPaymentNo,
        repairTaskNo: selectedTask.taskNo,
        serialNo: selectedTask.serialNo,
        machineName: selectedTask.machineName,
        vendorName: selectedTask.vendorName,
        billNo: selectedTask.billNo,
        totalBillAmount: selectedTask.totalBillAmount,
        paymentType: formData.paymentType,
        toBePaidAmount: formData.toBePaidAmount,
        billMatch: "No" // Default to not matched
      };

      addRepairPayment(newPayment);
      setHistoryRepairPayments([...historyRepairPayments, newPayment]);

      // Prepare the payload for Google Sheets
      const payload = {
        action: "insert1",  // Using "insert1" action which adds to row 6
        sheetName: "Repair FMS Advance Payment", // Correct sheet name from screenshot

        // Map form fields to sheet columns (adjust according to your actual sheet headers)
        "Timestamp": formattedDate,
        "Repair Task No": selectedTask.taskNo,
        "Serial No": selectedTask.serialNo,
        "Machine Name": selectedTask.machineName,
        "Vendor Name ": selectedTask?.vendorName,
        "Bill No.": selectedTask.billNo,
        "Total Bill Amount": selectedTask.totalBillAmount,
        "Payment Type": formData.paymentType, // Current timestamp
        "To Be Paid Amount": formData.toBePaidAmount,
        // Add any other required fields from your sheet
      };

      // Send the data to your Google Apps Script
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(payload).toString(),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Payment details submitted successfully!");
        setIsModalOpen(false);
        // Refresh data from server to ensure sync
        fetchPayments();
      } else {
        toast.error("Failed to submit payment details: " + (result.message || result.error));
        // Rollback local state if submission fails
        setHistoryRepairPayments(historyRepairPayments.filter(p => p.paymentNo !== nextPaymentNo));
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("An error occurred while submitting payment details");
    } finally {
      setSubmitLoading(false);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   try {
  //     setSubmitLoading(true);
  //     let billImageUrl = "";
  //     if (formData.productImage) {
  //       billImageUrl = await uploadFileToDrive(formData.productImage);
  //     }

  //     const payload = {
  //       action: "update1",
  //       sheetName: "Repair System",
  //       taskNo: selectedTask.taskNo,

  //       // Required Headers:
  //       Actual2: new Date().toLocaleString("en-GB", {
  //         timeZone: "Asia/Kolkata",
  //       }),
  //       "Received Quantity": formData.receivedQuantity,
  //       "Bill Match": formData.billMatch,
  //       "Bill Image": billImageUrl,
  //       "Bill No.": formData.billNo,
  //       "Product Image": billImageUrl,
  //     };

  //     const response = await fetch(SCRIPT_URL, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/x-www-form-urlencoded",
  //       },
  //       body: new URLSearchParams(payload).toString(),
  //     });

  //     const result = await response.json();
  //     console.log("Update result:", result);

  //     if (result.success) {
  //       alert("✅ Task updated successfully");
  //       setIsModalOpen(false);
  //       fetchAllTasks(); // refresh the table
  //     } else {
  //       alert("❌ Failed to update task: " + result.message);
  //     }
  //   } catch (error) {
  //     console.error("Submit error:", error);
  //     alert("❌ Something went wrong while submitting");
  //   } finally {
  //     setSubmitLoading(false);
  //   }
  // };



  const handleMouseEnter = (e, url) => {
    // Convert Google Drive 'view' links to 'preview' for better embedding
    let previewUrl = url;
    if (url.includes('drive.google.com') && url.includes('/view')) {
      previewUrl = url.replace('/view', '/preview');
    }
    setHoveredDoc(previewUrl);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredDoc(null);
  };

  return (
    <div className="space-y-6">
      {/* Hover Preview Tooltip */}
      {/* Hover Preview Tooltip */}
      {hoveredDoc && (
        <div
          style={{
            position: 'fixed',
            top: mousePos.y + 15,
            left: mousePos.x + 15,
            zIndex: 9999,
            width: '200px', // Increased slightly for better visibility
            height: '200px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          className="pointer-events-none"
        >
          {hoveredDoc.includes('drive.google.com') ? (
            <iframe
              src={hoveredDoc}
              title="Document Preview"
              className="w-full h-full border-none bg-gray-50"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          ) : /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(hoveredDoc) ? (
            <img
              src={hoveredDoc}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <iframe
              src={hoveredDoc}
              title="Document Preview"
              className="w-full h-full border-none bg-gray-50"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          )}
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Repair Advance</h1>
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
              Pending ({pendingRepairPayments.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${activeTab === "history"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              History ({historyRepairPayments.length})
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

        {/* {activeTab === "pending" && (
          <div>
          <Table>
            <TableHeader>
              <TableHead>Action</TableHead>
              <TableHead>Task Number</TableHead>
              <TableHead>Machine Name</TableHead>
              <TableHead>Vendor Name</TableHead>
              <TableHead>Bill No</TableHead>
              <TableHead>Total Bill Amount</TableHead>
              <TableHead>Payment Type</TableHead>
              <TableHead>To Be Paid Amount</TableHead>
            </TableHeader>
            <TableBody>
              {pendingTasks.map((task) => (
                <TableRow key={task.taskNo}>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handleMaterialClick(task)}
                      className="flex items-center"
                    >
                      <CreditCard className="w-3 h-3 mr-1" />
                      Material
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium text-blue-600">
                    {task.taskNo}
                  </TableCell>
                  <TableCell>{task.machineName}</TableCell>
                  <TableCell>{task.vendorName || "-"}</TableCell>
                  <TableCell>{task.billNo}</TableCell>
                  <TableCell>{task.totalBillAmount || "-"}</TableCell>
                  <TableCell>{task.paymentType || "-"}</TableCell>
                  <TableCell>{task.toBePaidAmount || "-"}</TableCell>
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
          <div>
          <Table>
            <TableHeader>
              
              <TableHead>Task Number</TableHead>
              <TableHead>Machine Name</TableHead>
              <TableHead>Vendor Name</TableHead>
              <TableHead>Bill No</TableHead>
              <TableHead>Total Bill Amount</TableHead>
              <TableHead>Payment Type</TableHead>
              <TableHead>To Be Paid Amount</TableHead>
            </TableHeader>
            <TableBody>
              {historyTasks.map((task) => (
                <TableRow key={task.taskNo}>
                  <TableCell className="font-medium text-blue-600">
                    {task.taskNo}
                  </TableCell>
                  <TableCell>{task.machineName}</TableCell>
                  <TableCell>{task.vendorName || "-"}</TableCell>
                  <TableCell>{task.billNo}</TableCell>
                  <TableCell>{task.totalBillAmount || "-"}</TableCell>
                  <TableCell>{task.paymentType || "-"}</TableCell>
                  <TableCell>{task.toBePaidAmount || "-"}</TableCell>
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
        )} */}



        {activeTab === "pending" && (
          <div>
            <Table>
              <TableHeader>
                <TableHead>Action</TableHead>
                <TableHead>Task Number</TableHead>
                <TableHead>Machine Name</TableHead>
                <TableHead>Serial No</TableHead>

                <TableHead>Planned Date</TableHead>
                <TableHead>Indenter</TableHead>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Lead Time</TableHead>
                <TableHead>Payment Type</TableHead>
                <TableHead>Transpoter Amount</TableHead>
                <TableHead>Bill Image</TableHead>
                <TableHead>Bill No</TableHead>
                <TableHead>Total Bill Amount</TableHead>
                <TableHead>To Be Paid</TableHead>
              </TableHeader>
              <TableBody>
                {pendingRepairPayments.map((task) => (
                  <TableRow key={task.taskNo}>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleMaterialClick(task)}
                        className="flex items-center"
                      >
                        <Package className="w-3 h-3 mr-1" />
                        Update
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium text-blue-600">
                      {task.taskNo}
                    </TableCell>
                    <TableCell>{task.machineName}</TableCell>
                    <TableCell>{task.serialNo}</TableCell>

                    <TableCell className="min-w-[150px]">
                      {formatDate(task.planned2)}
                    </TableCell>
                    <TableCell>{task.doerName}</TableCell>
                    <TableCell>{task.vendorName || "-"}</TableCell>
                    <TableCell>{task.leadTimeToDeliverDays}</TableCell>
                    <TableCell>{task.paymentType || "-"}</TableCell>

                    <TableCell>{task.howMuch || "-"}</TableCell>

                    <TableCell>
                      {task.billImage ? (
                        <a
                          href={task.billImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                          onMouseEnter={(e) => handleMouseEnter(e, task.billImage)}
                          onMouseMove={handleMouseMove}
                          onMouseLeave={handleMouseLeave}
                        >
                          View Image
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{task.billNo || "-"}</TableCell>
                    <TableCell>
                      ₹{task.totalBillAmount?.toLocaleString() || "-"}
                    </TableCell>
                    <TableCell>
                      ₹{task.toBePaidAmount?.toLocaleString() || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {loadingTasks && pendingRepairPayments.length === 0 && (
              <div className="flex flex-col items-center justify-center w-[75vw] mt-10">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Loading tasks...</p>
              </div>
            )}
            {!loadingTasks && pendingRepairPayments.length === 0 && (
              <div className="flex flex-col items-center justify-center w-[75vw] mt-10">
                <p className="mt-4 text-gray-600">No pending payments found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div>
            <Table>
              <TableHeader>
                <TableHead>Payment No.</TableHead>
                <TableHead>Repair Task No.</TableHead>

                <TableHead>Serial No</TableHead>

                <TableHead>Machine Name</TableHead>
                <TableHead>Vendor Name</TableHead>

                <TableHead>Bill No.</TableHead>

                <TableHead>Total Bill Amount</TableHead>
                <TableHead>Payment Type</TableHead>
                <TableHead>To Be Paid Amount</TableHead>

                <TableHead>Bill Match</TableHead>
              </TableHeader>
              <TableBody>
                {historyRepairPayments.map((task, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-blue-600">
                      {task.paymentNo}
                    </TableCell>
                    <TableCell>{task.repairTaskNo}</TableCell>
                    <TableCell>{task.serialNo}</TableCell>
                    <TableCell>{task.machineName}</TableCell>
                    <TableCell>{task.vendorName || "-"}</TableCell>
                    <TableCell>{task.billNo || "-"}</TableCell>

                    <TableCell>{task.totalBillAmount || "-"}</TableCell>
                    <TableCell>{task.paymentType || "-"}</TableCell>
                    <TableCell>{task.toBePaidAmount || "-"}</TableCell>


                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${task.billMatch === "Yes"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {task.billMatch === "Yes" ? "Matched" : "Not Matched"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {loadingTasks && historyRepairPayments.length === 0 && (
              <div className="flex flex-col items-center justify-center w-[75vw] mt-10">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Loading payment history...</p>
              </div>
            )}

            {!loadingTasks && historyRepairPayments.length === 0 && (
              <div className="flex flex-col items-center justify-center w-[75vw] mt-10">
                <p className="mt-4 text-gray-600">No payment history found</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Repair Advance Details"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment No. (Read-only)
              </label>
              <input
                type="text"
                value={"PN-001" || ""}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serial No (Read-only)
              </label>
              <input
                type="text"
                value={selectedTask?.serialNo || ""}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill No. (Read-only)
              </label>
              <input
                type="text"
                value={selectedTask?.billNo || ""}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repair Task Number (Read-only)
              </label>
              <input
                type="text"
                value={selectedTask?.taskNo || ""}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name (Read-only)
              </label>
              <input
                type="text"
                value={selectedTask?.vendorName || ""}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Bill Amount *
              </label>
              <input
                type="number"
                value={selectedTask?.totalBillAmount}
                readOnly
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    totalBillAmount: e.target.value,
                  }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Type *
              </label>
              <select
                value={formData.paymentType}
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
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Credit Card">Credit Card</option>
                <option value="UPI Payment">UPI Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount *
              </label>
              <input
                type="number"
                value={formData.toBePaidAmount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    toBePaidAmount: e.target.value,
                  }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MakePayment;
