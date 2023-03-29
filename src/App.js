import React, { useState } from "react";
import Papa from "papaparse";

function App() {
  const [csvData, setCsvData] = useState([]);
  const [output, setOutput] = useState([]);

  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    Papa.parse(file, {
      complete: function (results) {
        setCsvData(results.data);
      },
    });
  };

  const checkNULL = (str) => {
    if (str == "NULL") {
      const newDate = new Date();
      const year = newDate.getFullYear();
      const month = String(newDate.getMonth() + 1).padStart(2, "0");
      const day = String(newDate.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } else {
      return str;
    }
  };

  const parseDate = (str) => {
    const formats = [
      "YYYY-MM-DD",
      "M/D/YYYY",
      "MM/DD/YYYY",
      "MMM DD, YYYY",
      "MMMM D, YYYY",
      "MMM DD YYYY",
      "MMMM D YYYY",
      "DD/MM/YYYY",
      "D/M/YYYY",
    ];
    for (const format of formats) {
      const parsed = window.moment(str, format);
      if (parsed.isValid()) {
        return parsed.toDate();
      }
    }
    return null;
  };

  const calculateTime = (DateFrom, DateTo) => {
    const date1 = new Date(DateFrom);
    const date2 = new Date(DateTo);
    const timeDiff = Math.abs(date2 - date1);
    const daysWorked = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysWorked;
  };

  function findLargestTime(obj) {
    let largest = null;
    Object.keys(obj).forEach((key) => {
      if (largest === null || obj[key]["days"] > obj[largest]["days"]) {
        largest = key;
      }
    });
    return obj[largest];
  }

  const handleFindPairs = () => {
    const projects = {};
    csvData.map((row, index) => {
      const [EmpID, ProjectID, DateFrom, DateTo] = row;
      const dateTo = checkNULL(DateTo);
      const parsedDateFrom = parseDate(DateFrom);
      const parsedDateTo = parseDate(dateTo);
      const daysWorkedFirst = calculateTime(parsedDateFrom, parsedDateTo);

      if (!projects[ProjectID]) {
        projects[ProjectID] = { emp1: EmpID, project: ProjectID };
        csvData.map((row, index) => {
          const [SecondEmpID, FindProjectID, SecondDateFrom, SecondDateTo] =
            row;
          if (FindProjectID === ProjectID && SecondEmpID !== EmpID) {
            const dateTo2 = checkNULL(SecondDateTo);
            const parsedDateFrom = parseDate(SecondDateFrom);
            const parsedDateTo = parseDate(dateTo2);
            const daysWorkedSecond = calculateTime(
              parsedDateFrom,
              parsedDateTo
            );
            const daysWorked = daysWorkedFirst + daysWorkedSecond;

            projects[ProjectID]["emp2"] = SecondEmpID;
            projects[ProjectID]["days"] = daysWorked;
          }
        });
      }
    });
    const largestObject = findLargestTime(projects);
    setOutput(largestObject);
  };

  return (
    <div className="App">
      <input type="file" accept=".csv" onChange={handleCsvUpload} />
      <button onClick={handleFindPairs}>Find Pairs</button>
      {csvData.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Employee ID #1</th>
              <th>Employee ID #2</th>
              <th>Project ID</th>
              <th>Days worked</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(output).map((key) => (
              <tr key={key}>
                <td>{output[key].emp1}</td>
                <td>{output[key].emp2}</td>
                <td>{output[key].project}</td>
                <td>{output[key].days}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
