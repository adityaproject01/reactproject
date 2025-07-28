import { useEffect, useState, useRef } from "react";
import "./App.css";
import { Spreadsheet } from "react-spreadsheet";

function App() {
  const [fullData, setFullData] = useState([]);
  const [spreadsheetData, setSpreadsheetData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [headers, setHeaders] = useState([]);
  const [selection, setSelection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const scrollRef = useRef();
  const pageSize = 30;

  const convertJsonToSpreadsheetData = (json, headers = null) => {
    if (!json || json.length === 0) return [];

    const finalHeaders = headers || Object.keys(json[0]);
    const headerRow = finalHeaders.map((key) => ({ value: key }));

    const dataRows = json.map((item) =>
      finalHeaders.map((key) => {
        if (key.toLowerCase().includes("id")) {
          return {
            value: item[key],
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
      setHeaders(Object.keys(json[0]));

      const initialPage = json.slice(0, pageSize);
      const formatted = convertJsonToSpreadsheetData(initialPage);
      setSpreadsheetData(formatted);
    }

    fetchData();
  }, []);

  useEffect(() => {
    const filteredData = fullData.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    const sliced = filteredData.slice(0, currentPage * pageSize);
    const formatted = convertJsonToSpreadsheetData(sliced, headers);
    setSpreadsheetData(formatted);
  }, [searchTerm, fullData, currentPage, headers]);

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
    console.log("RAW selection: ", selection);

    if (!selection || !selection.range || !selection.range.start) {
      console.log("No selection made or invalid selection object.");
      return;
    }

    const { row, column } = selection.range.start;

    if (row === 0) {
      console.log("Header row selected — skipping download.");
      return;
    }

    const cell = spreadsheetData[row]?.[column];

    if (cell?.isDownload && cell.downloadUrl) {
      console.log("Downloading:", cell.value);
      const link = document.createElement("a");
      link.href = cell.downloadUrl;
      link.setAttribute("download", "");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.log("Selected Cell (not downloadable):", cell?.value || "N/A");
    }
  }, [selection, spreadsheetData]);

  return (
    <>
      <div className="container">
        <div className="tabs">
          <button>Bom</button>
          <button>Bom1</button>
          <button>Bom2</button>
        </div>
        <p>SpreedSheet</p>

        <div>
          <input
            type="text"
            className="searchItem"
            placeholder="Search Item"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to page 1 on new search
            }}
          />
        </div>
      </div>

      <div
        style={{ height: "90vh", overflowY: "auto" }}
        onScroll={handleScroll}
        ref={scrollRef}
      >
        {spreadsheetData.length > 0 ? (
          <Spreadsheet
            data={spreadsheetData}
            onChange={setSpreadsheetData}
            onSelect={setSelection}
          />
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </>
  );
}

export default App;
