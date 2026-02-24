// Google Apps Script - 이 코드를 Google Sheets의 Apps Script 에디터에 붙여넣으세요

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('예약관리');
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'create') {
      // 새 예약 추가
      const id = 'C' + new Date().getTime();
      const row = [
        id,
        data.customerName || '',
        data.customerPhone || '',
        data.eventDate || '',
        data.eventTime || '',
        data.guestCount || '',
        data.eventCategory || '',
        data.eventSubType || '',
        data.basePrice || 0,
        data.mealPrice || 0,
        data.optionPrice || 0,
        data.promotion || '',
        data.promotionAmount || 0,
        data.totalPrice || 0,
        data.depositAmount || 0,
        data.balanceAmount || 0,
        data.paymentMethod || '',
        data.contractStatus || '기본상담',
        data.memo || '',
        new Date().toISOString()
      ];
      sheet.appendRow(row);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        id: id
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === 'update') {
      // 예약 수정
      const values = sheet.getDataRange().getValues();
      for (let i = 1; i < values.length; i++) {
        if (values[i][0] === data.id) {
          sheet.getRange(i + 1, 2).setValue(data.customerName || '');
          sheet.getRange(i + 1, 3).setValue(data.customerPhone || '');
          sheet.getRange(i + 1, 4).setValue(data.eventDate || '');
          sheet.getRange(i + 1, 5).setValue(data.eventTime || '');
          sheet.getRange(i + 1, 6).setValue(data.guestCount || '');
          sheet.getRange(i + 1, 7).setValue(data.eventCategory || '');
          sheet.getRange(i + 1, 8).setValue(data.eventSubType || '');
          sheet.getRange(i + 1, 9).setValue(data.basePrice || 0);
          sheet.getRange(i + 1, 10).setValue(data.mealPrice || 0);
          sheet.getRange(i + 1, 11).setValue(data.optionPrice || 0);
          sheet.getRange(i + 1, 12).setValue(data.promotion || '');
          sheet.getRange(i + 1, 13).setValue(data.promotionAmount || 0);
          sheet.getRange(i + 1, 14).setValue(data.totalPrice || 0);
          sheet.getRange(i + 1, 15).setValue(data.depositAmount || 0);
          sheet.getRange(i + 1, 16).setValue(data.balanceAmount || 0);
          sheet.getRange(i + 1, 17).setValue(data.paymentMethod || '');
          sheet.getRange(i + 1, 18).setValue(data.contractStatus || '');
          sheet.getRange(i + 1, 19).setValue(data.memo || '');
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: true
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === 'delete') {
      // 예약 삭제
      const values = sheet.getDataRange().getValues();
      for (let i = 1; i < values.length; i++) {
        if (values[i][0] === data.id) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: true
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('예약관리');
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const data = [];
    
    for (let i = 1; i < values.length; i++) {
      const row = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = values[i][j];
      }
      data.push(row);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: data
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
