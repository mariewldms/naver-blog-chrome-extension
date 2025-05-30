// 메시지를 저장할 변수
let savedMessage = null;

// content script로부터 메시지를 받는 이벤트 리스너
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('background.js: content script로부터 메시지 수신:', message);
  
  // 메시지 타입 확인
  if (message.type === 'FROM_CONTENT_SCRIPT') {
    console.log('background.js: FROM_CONTENT_SCRIPT 타입의 메시지 수신');
    
    // 메시지를 저장합니다
    savedMessage = message.data.payload;
    console.log('background.js: 메시지 저장됨:', savedMessage);
    
    // Chrome Storage에 메시지를 저장합니다
    chrome.storage.local.set({ 
      savedMessage: message.data.payload
    }, () => {
      console.log('background.js: Chrome Storage에 메시지 저장됨:', message.data.payload);
    });
    
    // 응답 반환
    sendResponse({ received: true });
  }
  
  // 응답 반환
  return true;
});

// 확장프로그램이 설치되거나 업데이트될 때 실행
chrome.runtime.onInstalled.addListener(function() {
  console.log('background.js: 확장프로그램이 설치되었습니다.');
  
  // 항상 활성화 상태로 설정
  chrome.storage.local.set({ extensionEnabled: true }, function() {
    console.log('background.js: 확장프로그램을 항상 활성화 상태로 설정했습니다.');
  });
});

// 탭이 업데이트될 때 실행됩니다
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && 
      tab.url.includes('blog.naver.com') && 
      tab.url.includes('Redirect=Write&')) {
    console.log('background.js: 네이버 블로그 글쓰기 페이지 로드됨:', tab.url);
    
    // Chrome Storage에서 저장된 메시지를 불러옵니다
    chrome.storage.local.get(['savedMessage'], (result) => {
      if (result.savedMessage) {
        console.log('background.js: Chrome Storage에서 메시지 불러옴:', result.savedMessage);
        
        // 저장된 메시지가 있을 때만 content script로 전달합니다
        if (result.savedMessage && result.savedMessage.title && result.savedMessage.content) {
          console.log('background.js: 유효한 메시지가 있으므로 DOM 접근 메시지를 전송합니다.');
          
          // 저장된 메시지를 content script로 전달합니다
          chrome.tabs.sendMessage(tabId, {
            type: 'DOM_ACCESS',
            savedMessage: result.savedMessage
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.log('background.js: content script로 메시지 전송 실패:', chrome.runtime.lastError.message);
            } else {
              console.log('background.js: content script로부터 응답 수신:', response);
              
              // 메시지를 사용한 후 Chrome Storage에서 삭제합니다
              chrome.storage.local.remove(['savedMessage'], () => {
                console.log('background.js: Chrome Storage에서 메시지 삭제됨');
              });
            }
          });
        } else {
          console.log('background.js: 저장된 메시지가 유효하지 않습니다. DOM 접근 메시지를 전송하지 않습니다.');
        }
      } else {
        console.log('background.js: Chrome Storage에 저장된 메시지가 없습니다.');
      }
    });
  }
}); 