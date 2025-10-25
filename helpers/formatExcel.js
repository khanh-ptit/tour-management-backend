export const headerExcel = (sheet) => {
  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "004FA8" }, // xanh lá nhẹ
    };
    cell.alignment = { horizontal: "center" };
  });
};

export const setDefaultFont = (sheet) => {
  sheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      if (!cell.font) cell.font = {};
      cell.font = { ...cell.font, size: 13 };
    });
  });
};
