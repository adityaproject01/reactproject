// src/CustomDataViewer.js
import React from "react";

export function CustomDataViewer({ cell }) {
  if (!cell.downloadUrl) return <span>{cell.value}</span>;

  const handleClick = (e) => {
    e.preventDefault(); // stop cell edit
    e.stopPropagation(); // stop spreadsheet selection

    const link = document.createElement("a");
    link.href = cell.downloadUrl;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <span
      onClick={handleClick}
      style={{
        color: "blue",
        textDecoration: "underline",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {cell.value}
    </span>
  );
}
