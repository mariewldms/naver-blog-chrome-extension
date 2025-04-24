document.addEventListener('DOMContentLoaded', function() {
  console.log('popup.js: DOM이 로드되었습니다.');
  
  // 상태 텍스트 요소 가져오기
  const statusText = document.getElementById('statusText');
  
  // 항상 활성화 상태로 설정
  chrome.storage.local.set({ extensionEnabled: true }, function() {
    console.log('popup.js: 확장프로그램 활성화 상태를 true로 설정했습니다.');
  });
  
  // 상태 텍스트 업데이트
  updateStatusText(true);
  
  // background.js에 활성화 상태 알림
  chrome.runtime.sendMessage({
    type: 'TOGGLE_EXTENSION',
    enabled: true
  }, function(response) {
    console.log('popup.js: background.js로부터 응답 수신:', response);
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