document.addEventListener('DOMContentLoaded', function() {
  console.log('popup.js: DOM이 로드되었습니다.');
  
  // 요소 가져오기
  const toggleSwitch = document.getElementById('extensionToggle');
  const statusText = document.getElementById('statusText');
  
  // 저장된 활성화 상태 불러오기
  chrome.storage.local.get(['extensionEnabled'], function(result) {
    const isEnabled = result.extensionEnabled !== undefined ? result.extensionEnabled : false;
    toggleSwitch.checked = isEnabled;
    updateStatusText(isEnabled);
  });
  
  // 토글 스위치 변경 이벤트 리스너
  toggleSwitch.addEventListener('change', function() {
    const isEnabled = toggleSwitch.checked;
    console.log('popup.js: 확장프로그램 활성화 상태 변경:', isEnabled);
    
    // 활성화 상태 저장
    chrome.storage.local.set({ extensionEnabled: isEnabled }, function() {
      console.log('popup.js: 확장프로그램 활성화 상태 저장됨:', isEnabled);
    });
    
    // 상태 텍스트 업데이트
    updateStatusText(isEnabled);
    
    // background.js에 상태 변경 알림
    chrome.runtime.sendMessage({
      type: 'TOGGLE_EXTENSION',
      enabled: isEnabled
    }, function(response) {
      console.log('popup.js: background.js로부터 응답 수신:', response);
    });
  });
  
  // 상태 텍스트 업데이트 함수
  function updateStatusText(isEnabled) {
    if (isEnabled) {
      statusText.textContent = '확장프로그램이 활성화되어 있습니다.';
      statusText.style.color = '#4CAF50';
    } else {
      statusText.textContent = '확장프로그램이 비활성화되어 있습니다.';
      statusText.style.color = '#666';
    }
  }
}); 