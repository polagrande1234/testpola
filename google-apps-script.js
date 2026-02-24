// Google Apps Script - 이 코드를 Google Sheets의 Apps Script 에디터에 붙여넣으세요

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('예약관리');
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'create') {
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
        data.mealType || '',
        data.customMealPrice || 0,
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
        data.options || '',
        data.partners || '',
        new Date().toISOString()
      ];
      sheet.appendRow(row);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: '저장되었습니다',
        id: id
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === 'update') {
      const values = sheet.getDataRange().getValues();
      for (let i = 1; i < values.length; i++) {
        if (values[i][0] === data.id) {
          sheet.getRange(i + 1, 2, 1, 22).setValues([[
            data.customerName || '',
            data.customerPhone || '',
            data.eventDate || '',
            data.eventTime || '',
            data.guestCount || '',
            data.eventCategory || '',
            data.eventSubType || '',
            data.mealType || '',
            data.customMealPrice || 0,
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
            data.options || '',
            data.partners || ''
          ]]);
          return ContentService.createTextOutput(JSON.stringify({
            success: true,
            message: '수정되었습니다'
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }
    
    if (data.action === 'delete') {
      const values = sheet.getDataRange().getValues();
      for (let i = 1; i < values.length; i++) {
        if (values[i][0] === data.id) {
          sheet.deleteRow(i + 1);
          return ContentService.createTextOutput(JSON.stringify({
            success: true,
            message: '삭제되었습니다'
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: '알 수 없는 액션입니다'
    })).setMimeType(ContentService.MimeType.JSON);
    
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