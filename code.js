const SCHOOL_NAME = 'શ્રી કોરાડા વાડી પ્રાથમિક શાળા';
const TEACHER_NAME = 'પરબતભાઈ કરમુર';

function getAppConfig() {
  return { schoolName: SCHOOL_NAME, teacherName: TEACHER_NAME };
}

// તારીખને સરખાવવા માટે YYYY-MM-DD માં ફેરવે છે
function getStandardDate(cellValue) {
  if (!cellValue) return "";
  let str = cellValue.toString().trim();
  if (str.includes('-') && str.split('-')[0].length === 4) return str; // પહેલેથી YYYY-MM-DD
  if (str.includes('-')) {
    let parts = str.split('-');
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  if (str.includes('/')) {
    let parts = str.split('/');
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return "";
}

// ભારતીય ફોર્મેટ માટે (DD-MM-YYYY)
function getIndianDate(stdDate) {
  if(!stdDate) return "";
  let parts = stdDate.split('-');
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// JSON ફાઈલમાંથી ડેટા લાવવા અને ફિલ્ટર કરવા માટેનું નવું ફંક્શન
async function getRojnishiData(startDate, endDate) {
  try {
    // ગુગલ શીટની જગ્યાએ હવે સીધી જ આપણી JSON ફાઇલ લાવીશું
    const response = await fetch('Rojnishi_Final.json');
    
    if (!response.ok) {
      throw new Error("ડેટા ફાઇલ (JSON) મળી નથી. ફાઇલનું નામ સાચું છે કે કેમ તે ચેક કરો.");
    }

    const data = await response.json(); 
    
    const requiredColumns = ["તારીખ", "વાર", "તાસ", "ધોરણ", "વિષય", "એકમ", "અધ્યયન નિષ્પતિ", "શૈક્ષણિક મુદ્દા", "શિક્ષક-વિદ્યાર્થી પ્રવૃત્તિ", "સ્વ અધ્યયન", "મૂલ્યાંકન"];
    let groupedData = {};

    // JSON ડેટા પર લૂપ ચલાવીને તારીખ મુજબ ચેક કરો
    for (let i = 0; i < data.length; i++) {
      let row = data[i];
      let rawDate = row["તારીખ"]; // JSON માં સીધું 'તારીખ' હેડિંગ જ મળશે
      
      if (rawDate === undefined || rawDate === "") continue;
      
      let rowDateStd = getStandardDate(rawDate); // YYYY-MM-DD

      // તારીખ Range ની વચ્ચે છે કે નહિ તે ચેક કરો
      if (rowDateStd >= startDate && rowDateStd <= endDate) {
        let indianDate = getIndianDate(rowDateStd);
        
        let rowObj = {};
        requiredColumns.forEach(col => {
          // જો ડેટા હોય તો તે, નહિતર ડેશ (—) મૂકી દેશે
          let val = (row[col] !== undefined && row[col] !== "") ? row[col].toString() : "—";
          rowObj[col] = val;
        });

        // તે તારીખના એરેમાં ડેટા ઉમેરો
        if(!groupedData[indianDate]) {
           groupedData[indianDate] = [];
        }
        groupedData[indianDate].push(rowObj);
      }
    }

    return { success: true, data: groupedData };

  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}