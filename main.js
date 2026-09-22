function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Мапінг портфеля')
    .addItem('Відкрити панель мапінгу', 'showSidebar')
    .addToUi();
}

function showSidebar() {
  var html = HtmlService.createHtmlOutputFromFile('Dialog')
    .setTitle('Мапінг колонок портфеля')
    .setWidth(350);
  SpreadsheetApp.getUi().showSidebar(html);
}

function getActiveColumnIndex() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var cell = sheet.getActiveCell();
  return {
    index: cell.getColumn(),
    name: sheet.getRange(1, cell.getColumn()).getValue()
  };
}

function processWithMapping(mapping) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    throw new Error("Аркуш порожній або містить лише заголовки!");
  }
  
  var headers = data[0];
  var rows = data.slice(1);
  var output = [];
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    
    var getVal = function(colNum) {
      var idx = parseInt(colNum, 10);
      if (!idx || isNaN(idx) || idx <= 0 || idx > r.length) return "";
      return r[idx - 1];
    };

    var debt = Number(getVal(mapping.debt)) || 0;
    var body = Number(getVal(mapping.body)) || 0;
    var percent = Number(getVal(mapping.percent)) || 0;
    var fine = Number(getVal(mapping.fine)) || 0;
    var income = Number(getVal(mapping.income)) || 0; // Додано: зчитування доходу
    
    // --- Виправлена та безпечна логіка ДПД ---
    var rawDpd = getVal(mapping.dpd);
    var dpd = 0;
    
    if (rawDpd !== "" && rawDpd !== null) {
      if (rawDpd instanceof Date) {
        var diffTime = today.getTime() - rawDpd.getTime();
        dpd = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (dpd < 0) dpd = 0;
      } else if (typeof rawDpd === 'string' && (rawDpd.includes('-') || rawDpd.includes('.'))) {
        var parsedDate = new Date(rawDpd);
        if (!isNaN(parsedDate.getTime())) {
          parsedDate.setHours(0, 0, 0, 0);
          var diffTime = today.getTime() - parsedDate.getTime();
          dpd = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          if (dpd < 0) dpd = 0;
        } else {
          dpd = Number(rawDpd) || 0;
        }
      } else {
        dpd = Number(rawDpd) || 0;
      }
    }
    
    var dpdCategory = getDpdCategory(dpd);
    var regionRaw = String(getVal(mapping.region));
    var region = parseRegion(regionRaw);
    
    var dobRaw = getVal(mapping.dob);
    var dob = dobRaw ? new Date(dobRaw) : null;
    var age = (dob && !isNaN(dob.getTime())) ? calculateAge(dob) : 0;
    
    var genderRaw = String(getVal(mapping.gender));
    var gender = parseGender(genderRaw);
    
    var issued = getVal(mapping.issued);
    var paymentsCount = Number(getVal(mapping.payCount)) || 0;
    var hasPayers = paymentsCount > 0 ? 'Так' : null;
    
    var sumPayments = getVal(mapping.paySum);
    var lastPayDate = getVal(mapping.lastPay);
    var lastContact = getVal(mapping.lastContact);
    var prolong = getVal(mapping.prolong);
    
    var tot = ['Донецька', 'Херсонська', 'Луганська', 'Запорізька', 'Крим'].some(function(reg) {
      return region.includes(reg);
    }) ? 'Так' : null;
    
    var ageCategory = getAgeCategory(age);
    var isPensioner = (age > 60 && gender === 'ж') || (age > 65 && gender === 'ч') ? 'Так' : null;
    var debtCategory = getDebtCategory(debt);
    var bodyCategory = getBodyCategory(body);
    
    var bodyRatio = (debt > 0) ? (body / debt) : 0;
    var bodyRatioFormatted = (bodyRatio * 100).toFixed(2).replace('.', ',') + '%';
    var bodyRatioCategory = getBodyRatioCategory(bodyRatio);

    var debtWithoutFine = debt - fine;
    var isPotentiallySued = (body > 5000 && debt > 10000 && age <= 60 && !tot) ? 'Так' : null;

    output.push([
      region,
      tot,
      age,
      ageCategory,
      gender,
      isPensioner,
      debtCategory,
      bodyCategory,
      bodyRatioFormatted,
      dpd,
      dpdCategory,
      debt,
      body,
      percent,
      fine,
      income, // Виведено колоноку Дохід у звіт
      hasPayers,
      sumPayments,
      lastPayDate,
      prolong,
      debtWithoutFine,
      isPotentiallySued,
      issued
    ]);
  }
  
  var headersOutput = [
    "Область", "ТОТ", "Вік", "Категорія віку", "Стать", "Пенсіонер", 
    "Категорія боргу", "Категорія тіла", "% тіла від боргу", "DPD", "Категорія DPD", 
    "Борг", "Тіло", "%", "Штрафи/пені, грн", "Дохід", "К-сть платящих", 
    "Сума сплат", "Дата останньої сплати", "Пролонгація", 
    "Борг без пені/штрафів", "Потенційно під суди", "Сума видачі"
  ];
  
  var startCol = headers.length + 1; 
  var totalColsNeeded = startCol + headersOutput.length - 1;
  var currentMaxCols = sheet.getMaxColumns();
  
  // Захист: автоматично додаємо колонки, якщо розмір таблиці занадто малий
  if (totalColsNeeded > currentMaxCols) {
    sheet.insertColumnsAfter(currentMaxCols, totalColsNeeded - currentMaxCols);
  }
  
  // Запис даних
  sheet.getRange(1, startCol, 1, headersOutput.length).setValues([headersOutput]);
  if (output.length > 0) {
    sheet.getRange(2, startCol, output.length, output[0].length).setValues(output);
  }

  // Стилізація
  var reportRange = sheet.getRange(1, startCol, output.length + 1, headersOutput.length);
  reportRange.setFontFamily("Calibri");
  reportRange.setFontSize(11);
  
  var headerRange = sheet.getRange(1, startCol, 1, headersOutput.length);
  headerRange.setBackground("#FFFF00");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  
  reportRange.setBorder(true, true, true, true, true, true, "#d9d9d9", SpreadsheetApp.BorderStyle.SOLID);
  
  return "Успішно сформовано звіт!";
}

// --- Виправлена точна функція обчислення віку ---
function calculateAge(dob) {
  var today = new Date();
  var age = today.getFullYear() - dob.getFullYear();
  var m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age < 0 ? 0 : age;
}

function parseRegion(val) {
  if (!val) return "(не визначено)";
  var v = String(val).toLowerCase();
  if (v.includes('він') || v.includes('vin')) return 'Вінницька область';
  if (v.includes('вол') || v.includes('vol')) return 'Волинська обл.';
  if (v.includes('дніп') || v.includes('dnip') || v.includes('днеп')) return 'Дніпропетровська область';
  if (v.includes('дон') || v.includes('don')) return 'Донецька область';
  if (v.includes('житом') || v.includes('zhy')) return 'Житомирська обл.';
  if (v.includes('зак') || v.includes('zak')) return 'Закарпатська область';
  if (v.includes('зап') || v.includes('zap')) return 'Запорізька область';
  if (v.includes('іван') || v.includes('ivan') || v.includes('иван')) return 'Івано-Франківська область';
  if (v.includes('київс') || v.includes('kievs') || v.includes('kyivs')) return 'Київська обл.';
  if (v.includes('кір') || v.includes('kir') || v.includes('кир')) return 'Кіровоградська обл.';
  if (v.includes('луг') || v.includes('lug')) return 'Луганська область';
  if (v.includes('льв') || v.includes('lvi')) return 'Львівська область';
  if (v.includes('мик') || v.includes('myk') || v.includes('ник')) return 'Миколаївська область';
  if (v.includes('одес') || v.includes('odes')) return 'Одеська область';
  if (v.includes('полт') || v.includes('polt')) return 'Полтавська область';
  if (v.includes('рів') || v.includes('riv') || v.includes('ров')) return 'Рівненська область';
  if (v.includes('сум') || v.includes('sum')) return 'Сумська область';
  if (v.includes('терн') || v.includes('ter')) return 'Тернопільська область';
  if (v.includes('хар') || v.includes('har')) return 'Харківська область';
  if (v.includes('херс') || v.includes('her')) return 'Херсонська область';
  if (v.includes('хмел') || v.includes('hme')) return 'Хмельницька область';
  if (v.includes('черк')) return 'Черкаська область';
  if (v.includes('чернів') || v.includes('cherniv')) return 'Чернівецька область';
  if (v.includes('черніг') || v.includes('chernig') || v.includes('черниг')) return 'Чернігівська область';
  if (v.includes('кри') || v.includes('krym')) return 'Крим';
  if (v.includes('р-н') || v.includes('київ') || v.includes('kiev') || v.includes('киев')) return 'Київ';
  return val;
}

function parseGender(val) {
  var v = String(val).toLowerCase();
  if (v.includes('f') || v.includes('ж')) return 'ж';
  if (v.includes('м') || v.includes('m') || v.includes('ч')) return 'ч';
  return '-';
}

function getAgeCategory(age) {
  if (age >= 18 && age <= 19) return '1. 19-20';
  if (age >= 20 && age < 25) return '2. 20-25';
  if (age >= 25 && age < 30) return '3. 25-30';
  if (age >= 30 && age < 35) return '4. 30-35';
  if (age >= 35 && age < 40) return '5. 35-40';
  if (age >= 40 && age < 45) return '6. 40-45';
  if (age >= 45 && age < 50) return '7. 45-50';
  if (age >= 50 && age < 55) return '8. 50-55';
  if (age >= 55 && age < 60) return '9. 55-60';
  if (age >= 60 && age < 65) return '10. 60-65';
  return '11. 66+';
}

function getDebtCategory(b) {
  if (b <= 1000) return '1. <1к';
  if (b <= 2500) return '2. 1-2,5к';
  if (b <= 5000) return '3. 2,5-5к';
  if (b <= 10000) return '4. 5-10к';
  if (b <= 20000) return '5. 10-20к';
  if (b <= 40000) return '6. 20-40к';
  if (b <= 80000) return '7. 40-80к';
  if (b <= 125000) return '8. 80-125к';
  return '9. 125к+';
}
//DEV by AID
function getBodyCategory(t) {
  if (t <= 1000) return '1. <1к';
  if (t <= 2500) return '2. 1-2,5к';
  if (t <= 5000) return '3. 2,5-5к';
  if (t <= 10000) return '4. 5-10к';
  if (t <= 20000) return '5. 10-20к';
  if (t <= 40000) return '6. 20-40к';
  if (t <= 60000) return '7. 40-60к';
  if (t <= 80000) return '8. 60-80к';
  return '9. 80к+';
}

function getBodyRatioCategory(ratio) {
  if (ratio <= 0) return '1. 0%';
  if (ratio <= 0.20) return '2. 0-20%';
  if (ratio <= 0.40) return '3. 20-40%';
  if (ratio <= 0.60) return '4. 40-60%';
  if (ratio <= 0.80) return '5. 60-80%';
  if (ratio < 1.00) return '6. 80-99%';
  return '7. 100%';
}

function getDpdCategory(dpd) {
  if (dpd <= 180) return '1. <0,5р.';
  if (dpd <= 365) return '2. 0,5-1р.';
  if (dpd <= 730) return '3. 1-2р.';
  return '4. 2р.+';
}