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

// ગૂગલ શીટમાંથી લાઈવ ડેટા લાવવા અને ફિલ્ટર કરવા માટેનું ફંક્શન
async function getRojnishiData(startDate, endDate) {
  try {
    // હવે ડેટા JSON ફાઈલની જગ્યાએ સીધો તમારી Google Sheet ની લાઈવ લિંક પરથી આવશે
    const sheetURL = "https://script.google.com/macros/s/AKfycbyjXDeRgaDVqMIDvtZaCj9gLxI61pubZ1duC-LRUzVJnuHEOuS6-ei2S_GLkiN6Ab1e5g/exec";
    const response = await fetch(sheetURL);
    
    if (!response.ok) {
      throw new Error("ગૂગલ શીટમાંથી ડેટા મળી રહ્યો નથી. લિંક અથવા ઇન્ટરનેટ કનેક્શન ચેક કરો.");
    }

    const data = await response.json(); 
    
    // છેલ્લા બે નામ સુધારેલા છે
    const requiredColumns = ["તારીખ", "વાર", "તાસ", "ધોરણ", "વિષય", "એકમ", "અધ્યયન નિષ્પતિ", "શૈક્ષણિક મુદ્દા", "શિક્ષક-વિદ્યાર્થી પ્રવૃત્તિ", "સ્વ.અધ્યયન/સંદર્ભ સાહિત્ય", "મૂલ્યાંકન/ગૃહકાર્ય"];
    let groupedData = {};

    // ડેટા પર લૂપ ચલાવીને તારીખ મુજબ ચેક કરો
    for (let i = 0; i < data.length; i++) {
      let row = data[i];
      let rawDate = row["તારીખ"]; // શીટમાં 'તારીખ' હેડિંગ જ મળશે
      
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
