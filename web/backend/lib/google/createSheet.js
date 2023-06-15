const csvData = `id, name, total_cash\n1,John,1000\n2,Doe,1300`;
const csv = csvData.split("\n").map((row) => row.split(","));

// https://dev.to/jessesbyers/add-basic-and-conditional-formatting-to-a-spreadsheet-using-the-google-sheets-api-376f

/**
 *
 * @param {import('@googleapis/sheets').sheets_v4.Sheets} sheets
 * @param {string} [folderId]
 */
export async function createXlxs(sheets, folderId) {
  const fileMetadata = {
    mimeType: "application/vnd.google-apps.spreadsheet",
  };

  const media = {
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // body: fs.createReadStream(path.resolve('src', 'files', 'excel', 'solargroup.xlsx'))
  };

  sheets.spreadsheets
    .create({
      requestBody: {
        properties: {
          title: "test-sheet",
          // parents: folderId ? [folderId] : undefined,
          // local for france
          // locale: "fr",
          // locale: "fr",
        },
      },
    })
    .then((response) => {
      const spreadsheetId = response.data.spreadsheetId;
      // Prepare the data in the desired format

      // Write the data to the sheet
      sheets.spreadsheets.values
        .update({
          spreadsheetId,
          range: "Sheet1",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: csv,
          },
        })
        .then(() => {
          console.log("CSV data inserted into Google Sheets successfully.");

          // Apply formatting to the columns
          sheets.spreadsheets
            .batchUpdate({
              spreadsheetId,
              requestBody: {
                requests: [
                  // update locale
                  //(spanish allows correct number formatting. Period in thousand separator and comma in decimal separator)
                  {
                    updateSpreadsheetProperties: {
                      properties: {
                        locale: "es_ES",
                      },
                      fields: "locale",
                    },
                  },
                  {
                    updateSheetProperties: {
                      properties: {
                        gridProperties: {
                          frozenRowCount: 1,
                        },
                      },
                      fields: "gridProperties.frozenRowCount",
                    },
                  },
                  // bold the first row
                  {
                    repeatCell: {
                      range: {
                        sheetId: 0, // Assuming the first sheet (Sheet1)
                        startRowIndex: 0, // Starting from the first row (headers)
                        endRowIndex: 1, // Only formatting the header row
                      },
                      cell: {
                        userEnteredFormat: {
                          textFormat: {
                            bold: true,
                          },
                        },
                      },
                      fields: "userEnteredFormat.textFormat.bold",
                    },
                  },
                  // Format id column as number
                  {
                    repeatCell: {
                      range: {
                        sheetId: 0, // Assuming the first sheet (Sheet1)
                        startRowIndex: 1, // Starting from the second row (data rows)
                        startColumnIndex: 0,
                      },
                      cell: {
                        userEnteredFormat: {
                          numberFormat: {
                            type: "NUMBER", // Formatting id column as number
                          },
                        },
                      },
                      fields: "userEnteredFormat.numberFormat",
                    },
                  },
                  // Format currency column as currency
                  {
                    repeatCell: {
                      range: {
                        sheetId: 0, // Assuming the first sheet (Sheet1)
                        startRowIndex: 1, // Starting from the second row (data rows),
                        startColumnIndex: 2,
                      },
                      cell: {
                        userEnteredFormat: {
                          numberFormat: {
                            type: "CURRENCY", // Formatting total_cash column as currency
                            // pattern: "$#,##0,00",
                            // pattern: `$#,##0.00_);($#,##0.00)`,
                            // pattern: "$#,##0.00;-#,##0.00",
                            pattern: "€#,##0.00",
                          },
                        },
                      },
                      fields: "userEnteredFormat.numberFormat",
                    },
                  },
                ],
              },
            })
            .then(() => {
              console.log("Formatting applied to the columns successfully.");
            })
            .catch((err) => {
              console.error("Error applying formatting:", err);
            });
        })
        .catch((err) => {
          console.error("Error inserting data into Google Sheets:", err);
        });
    })
    .catch((err) => {
      console.error("Error creating Google Sheets spreadsheet:", err);
    });
}
