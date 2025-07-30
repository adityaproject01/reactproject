import { useEffect, useState, useRef } from "react";
import "./App.css";
import { Spreadsheet } from "react-spreadsheet";

function App() {
  const [fullData, setFullData] = useState([]);
  const [spreadsheetData, setSpreadsheetData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [bomHeaders, setBomHeaders] = useState([]);
  const [bom1Headers, setBom1Headers] = useState([]);
  const [selection, setSelection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Bom");

  const [bom1Data, setBom1Data] = useState([]);
  const [bom1SpreadsheetData, setBom1SpreadsheetData] = useState([]);

  const scrollRef = useRef();
  const pageSize = 30;

  const convertJsonToSpreadsheetData = (json, headers = null) => {
    if (!json || json.length === 0) return [];

    const finalHeaders = headers || Object.keys(json[0]);

    const headerRow = finalHeaders.map((key) => ({
      value: key,
      className: "spreadsheet-header", // Apply custom class
      readOnly: true, // ✅ disable editing header
    }));

    const dataRows = json.map((item) =>
      finalHeaders.map((key) => {
        
        if (key.toLowerCase().includes("id")) {
          return {
            value: item[key],
            readOnly: true, // ✅ disable editing header

            downloadUrl:
              "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            isDownload: true,
          };
        }
        return { value: item[key] };
      })
    );

    return [headerRow, ...dataRows];
  };

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(
        "https://microsoftedge.github.io/Demos/json-dummy-data/5MB.json"
      );
      const json = await res.json();
      setFullData(json);

      const bomKeys = Object.keys(json[0]);
      setBomHeaders(bomKeys);

      const initialPage = json.slice(0, pageSize);
      const formatted = convertJsonToSpreadsheetData(initialPage, bomKeys);
      setSpreadsheetData(formatted);
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab !== "Bom") return;

    const filteredData = fullData.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    const sliced = filteredData.slice(0, currentPage * pageSize);
    const formatted = convertJsonToSpreadsheetData(sliced, bomHeaders);
    setSpreadsheetData(formatted);
  }, [searchTerm, fullData, currentPage, bomHeaders, activeTab]);

  useEffect(() => {
    async function fetchBom1Data() {
      try {
        const res = await fetch("https://dummyjson.com/products");
        const data = await res.json();
        const items = data.products || [];
        setBom1Data(items);
        const headers = Object.keys(items[0]);
        setBom1Headers(headers);

        const formatted = convertJsonToSpreadsheetData(items, headers);
        setBom1SpreadsheetData(formatted);
      } catch (error) {
        console.error("Error fetching Bom1 data:", error);
      }
    }

    if (activeTab === "Bom1" && bom1Data.length === 0) {
      fetchBom1Data();
    }
  }, [activeTab, bom1Data.length]);

  useEffect(() => {
    if (activeTab !== "Bom1") return;

    const filteredData = bom1Data.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    const formatted = convertJsonToSpreadsheetData(filteredData, bom1Headers);
    setBom1SpreadsheetData(formatted);
  }, [searchTerm, bom1Data, bom1Headers, activeTab]);

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const bottom =
      scrollRef.current.scrollHeight - scrollRef.current.scrollTop <=
      scrollRef.current.clientHeight + 10;

    if (bottom && fullData.length > currentPage * pageSize) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
    }
  };

  useEffect(() => {
    if (!selection || !selection.range || !selection.range.start) return;

    const { row, column } = selection.range.start;
    if (row === 0) return;

    const cell =
      activeTab === "Bom"
        ? spreadsheetData[row]?.[column]
        : bom1SpreadsheetData[row]?.[column];

    if (cell?.isDownload && cell.downloadUrl) {
      window.open(cell.downloadUrl, "_blank");
    }
  }, [selection, spreadsheetData, bom1SpreadsheetData, activeTab]);

  return (
    <div className="mainContainer">
      <div className="container">
        <div className="tabs">
          <button onClick={() => setActiveTab("Bom")}>Bom</button>
          <button onClick={() => setActiveTab("Bom1")}>Bom1</button>
          <button onClick={() => setActiveTab("Bom2")}>Bom2</button>
        </div>
        <p>Spreadsheet</p>

        <div>
          <input
            type="text"
            className="searchItem"
            placeholder="Search Item"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div
        style={{ height: "90vh", overflowY: "auto" }}
        onScroll={activeTab === "Bom" ? handleScroll : undefined}
        ref={scrollRef}
      >
        {activeTab === "Bom" && spreadsheetData.length > 0 && (
          <Spreadsheet
            data={spreadsheetData}
            onChange={setSpreadsheetData}
            onSelect={setSelection}
          />
        )}

        {activeTab === "Bom1" && bom1SpreadsheetData.length > 0 && (
          <Spreadsheet
            data={bom1SpreadsheetData}
            onChange={setBom1SpreadsheetData}
            onSelect={setSelection}
          />
        )}

        {activeTab === "Bom2" && <p>Bom2 content goes here.</p>}

        {(activeTab === "Bom" && spreadsheetData.length === 0) ||
        (activeTab === "Bom1" && bom1SpreadsheetData.length === 0) ? (
          <p>Loading...</p>
        ) : null}
      </div>
    </div>
  );
}

export default App;
