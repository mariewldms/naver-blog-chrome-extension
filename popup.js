document.addEventListener('DOMContentLoaded', function() {
  console.log('popup.js: DOM이 로드되었습니다.');
  
  // 버튼 요소 가져오기
  const button = document.getElementById('autoInputButton');
  const resultDiv = document.getElementById('result');
  
  // 버튼 클릭 이벤트 리스너 추가
  button.addEventListener('click', function() {
    console.log('popup.js: 버튼이 클릭되었습니다.');
    // 
    // 현재 활성화된 탭의 정보를 가져옵니다
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentTab = tabs[0];
      console.log('popup.js: 현재 탭 URL:', currentTab.url);
      
      // 네이버 블로그 페이지인지 확인
      if (currentTab.url.includes('blog.naver.com')) {
        console.log('popup.js: 네이버 블로그 페이지 감지');
        
        // 결과 메시지 업데이트
        resultDiv.textContent = '제목 입력 중...';
        
        // Chrome Storage에서 저장된 메시지 가져오기
        chrome.storage.local.get(['savedMessage'], function(result) {
          if (result.savedMessage) {
            console.log('popup.js: 저장된 메시지 발견:', result.savedMessage);
            
            // 네이버 블로그 페이지에 포커스를 주고 제목 입력란을 찾아 텍스트 입력
            try {
              chrome.scripting.executeScript({
                target: { tabId: currentTab.id },
                function: async (savedMessage) => {
                  console.log('popup.js: 스크립트 실행 시작, 저장된 메시지:', savedMessage);
                  
                  // DOM이 로드되었는지 확인
                  if (document.readyState === 'complete') {
                    console.log('popup.js: DOM이 로드되었습니다');
                    
                    // iframe을 찾습니다
                    const iframe = document.querySelector('#mainFrame');
                    if (!iframe) {
                      console.log('popup.js: iframe을 찾을 수 없습니다.');
                      return;
                    }
                    
                    console.log('popup.js: iframe 발견');
                    
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    
                    // 제목 입력란을 찾습니다
                    const titleSection = iframeDoc.querySelector('.se-section-documentTitle');
                    if (!titleSection) {
                      console.log('popup.js: 제목 입력란을 찾을 수 없습니다.');
                      return;
                    }
                    
                    console.log('popup.js: 제목 입력란 발견');
                    
                    // 1.5초 대기
                    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
                    await sleep(1500);
                    
                    // 제목 입력란에 명시적으로 포커스를 줍니다
                    titleSection.focus();
                    console.log('popup.js: 제목 입력란에 포커스 설정');
                    
                    // 0.5초 대기
                    await sleep(500);
                    
                    // 제목 입력란 내부의 contenteditable 요소를 찾습니다
                    const editableElement = iframeDoc.querySelector('[contenteditable="true"]');
                    if (!editableElement) {
                      console.error('popup.js: contenteditable 요소를 찾을 수 없습니다.');
                      return;
                    }
                    
                    console.log('popup.js: contenteditable 요소 발견');
                    
                    // 입력할 텍스트
                    const text = savedMessage.payload.myState;
                    
                    // paste 이벤트 발생시킴
                    const data = new DataTransfer();
                    data.setData('text/plain', text);
                    
                    const pasteEvent = new ClipboardEvent('paste', {
                      bubbles: true,
                      cancelable: true,
                      clipboardData: data
                    });
                    
                    editableElement.dispatchEvent(pasteEvent);
                    console.log('popup.js: 텍스트 입력 완료:', text);
                    
                    // 0.5초 대기
                    await sleep(500);
                    
                    console.log('popup.js: 모든 작업 완료');
                  } else {
                    console.log('popup.js: DOM이 아직 로드되지 않았습니다.');
                  }
                },
                args: [result.savedMessage]
              });
              
              // 성공 메시지를 표시합니다
              setTimeout(() => {
                resultDiv.textContent = '제목이 입력되었습니다.';
              }, 2000);
            } catch (error) {
              console.error('popup.js: 스크립트 실행 중 오류 발생:', error);
              resultDiv.textContent = '오류가 발생했습니다: ' + error.message;
            }
          } else {
            console.log('popup.js: 저장된 메시지가 없습니다.');
            resultDiv.textContent = '저장된 메시지가 없습니다.';
          }
        });
      } else {
        console.log('popup.js: 네이버 블로그 페이지가 아닙니다.');
        resultDiv.textContent = '네이버 블로그 페이지에서만 사용할 수 있습니다.';
      }
    });
  });
}); 