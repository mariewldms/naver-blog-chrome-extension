// 페이지 로드 완료 시 메시지 전송
console.log('content.js 로드 완료');

// 웹 페이지에서 메시지를 감지하는 이벤트 리스너
window.addEventListener('message', (event) => {
  console.log('content.js: 웹 페이지에서 메시지 수신됨', event.data);
  
  // 메시지 타입 확인
  console.log('content.js: 메시지 타입:', event.data?.type);
  
  // BLOG_AUTO_INPUT 타입 메시지 처리
  if (event.data?.type === 'BLOG_AUTO_INPUT') {
    console.log('content.js: BLOG_AUTO_INPUT 메시지 감지:', event.data);
    
    // 메시지를 background script로 전달
    try {
      chrome.runtime.sendMessage({
        type: 'FROM_CONTENT_SCRIPT',
        data: event.data
      }, response => {
        if (chrome.runtime.lastError) {
          console.log('content.js: background script로 메시지 전송 실패:', chrome.runtime.lastError.message);
        } else {
          console.log('content.js: background script로부터 응답 수신:', response);
        }
      });
    } catch (error) {
      console.error('content.js: background script로 메시지 전송 중 오류 발생:', error);
    }
  }
});

// background.js로부터 메시지를 받는 이벤트 리스너
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('content.js: background.js로부터 메시지 수신됨:', message);
  
  // 메시지 타입 확인
  if (message.type === 'DOM_ACCESS') {
    console.log('content.js: DOM_ACCESS 타입의 메시지 수신');
    
    // 저장된 메시지 확인
    if (message.savedMessage) {
      console.log('content.js: 저장된 메시지 발견:', message.savedMessage);
      
      // 작업 완료 여부를 추적하는 변수
      let isCompleted = false;
      
      // DOM 접근 및 텍스트 입력
      (async function() {
        // DOM이 로드되었는지 확인
        if (document.readyState === 'complete') {
          console.log('content.js: DOM이 로드되었습니다');
          
          // iframe을 찾습니다
          const iframe = document.querySelector('#mainFrame');
          if (!iframe) {
            console.log('content.js: iframe을 찾을 수 없습니다.');
            return;
          }
          
          console.log('content.js: iframe 발견');
          
          // iframe 로딩 대기
          iframe.onload = async function() {
            // 이미 작업이 완료되었으면 다시 실행하지 않음
            if (isCompleted) {
              console.log('content.js: 이미 작업이 완료되었으므로 다시 실행하지 않습니다.');
              return;
            }
            
            console.log('content.js: iframe 로딩 완료');
            
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            
            // 제목 입력란이 등장할 때까지 반복 체크
            let tries = 0;
            const maxTries = 20;
            const interval = setInterval(async () => {
              const titleSection = iframeDoc.querySelector('.se-section-documentTitle');
              const contentSection = iframeDoc.querySelector('.se-section-text');
              console.log(`[시도 ${tries + 1}] 제목 영역:`, titleSection);
              
              if (titleSection) {
                console.log('content.js: 제목 입력란 발견');
                clearInterval(interval);
                
                // 제목 입력란에 명시적으로 포커스를 줍니다
                titleSection.focus();
                console.log('content.js: 제목 입력란에 포커스 설정');
                
                // 5초 대기
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                // 위쪽 화살표 키 이벤트를 생성합니다
                const arrowUpEvent = new KeyboardEvent('keydown', {
                  key: 'ArrowUp',
                  code: 'ArrowUp',
                  keyCode: 38,
                  which: 38,
                  bubbles: true,
                  cancelable: true
                });
                
                // 위쪽 화살표 키 이벤트를 발생시킵니다
                titleSection.dispatchEvent(arrowUpEvent);
                
                // 0.5초 대기
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const editableElement = iframeDoc.querySelector('[contenteditable="true"]');
                if (!editableElement) {
                  console.error('content.js: contenteditable 요소를 찾을 수 없습니다.');
                  return;
                }
                
                // 입력할 텍스트
                const text = message.savedMessage.title;
                const text2 = message.savedMessage.content;
                
                // paste 이벤트 발생시킴
                const data = new DataTransfer();
                data.setData('text/plain', text);
                
                const pasteEvent = new ClipboardEvent('paste', {
                  bubbles: true,
                  cancelable: true,
                  clipboardData: data
                });
                
                editableElement.dispatchEvent(pasteEvent);
                
                // 0.5초 대기
                await new Promise(resolve => setTimeout(resolve, 500));
                
                if(contentSection){
                  console.log('content.js: 컨텐츠 입력란 발견');
                  contentSection.focus();
                  
                  // 0.5초 대기
                  await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                const arrowDownEvent = new KeyboardEvent('keydown', {
                  key: 'ArrowDown',
                  code: 'ArrowDown',
                  keyCode: 40,
                  which: 40,
                  bubbles: true,
                  cancelable: true
                });
                
                contentSection.dispatchEvent(arrowDownEvent);
                
                // 0.5초 대기
                await new Promise(resolve => setTimeout(resolve, 500));
                // paste 이벤트 발생시킴
                const data2 = new DataTransfer();
                data2.setData('text/plain', text2);
                
                const pasteEvent2 = new ClipboardEvent('paste', {
                  bubbles: true,
                  cancelable: true,
                  clipboardData: data2
                });
                
                editableElement.dispatchEvent(pasteEvent2);
                
                // 0.5초 대기
                await new Promise(resolve => setTimeout(resolve, 500));
                
                console.log('content.js: 모든 작업 완료');
                
                // 발행 버튼 클릭
                try {
                  // 발행 버튼을 찾습니다 (클래스명 사용)
                  const publishButton = iframeDoc.querySelector('.publish_btn__m9KHH');
                  if (publishButton) {
                    console.log('content.js: 발행 버튼 발견 (클래스명 사용)');
                    
                    // 1초 대기
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // 발행 버튼 클릭
                    publishButton.click();
                    console.log('content.js: 발행 버튼 클릭 완료');
                    
                    // 2초 대기 (확인 버튼이 나타날 때까지)
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    // 확인 버튼 클릭 (data-testid 사용)
                    const confirmButton = iframeDoc.querySelector('[data-testid="seOnePublishBtn"]');
                    if (confirmButton) {
                      console.log('content.js: 확인 버튼 발견 (data-testid 사용)');
                      
                      // 확인 버튼 클릭
                      confirmButton.click();
                      console.log('content.js: 확인 버튼 클릭 완료');
                      
                      // 작업 완료 플래그 설정
                      isCompleted = true;
                      console.log('content.js: 작업 완료 플래그 설정됨');
                      
                      // iframe의 onload 이벤트 핸들러 제거
                      iframe.onload = null;
                      console.log('content.js: iframe onload 이벤트 핸들러 제거됨');
                    } else {
                      console.log('content.js: 확인 버튼을 찾을 수 없습니다.');
                    }
                  } else {
                    console.log('content.js: 발행 버튼을 찾을 수 없습니다.');
                  }
                } catch (error) {
                  console.error('content.js: 버튼 클릭 중 오류 발생:', error);
                }
              } else {
                tries++;
                if (tries >= maxTries) {
                  console.log('content.js: 제목 입력란을 찾을 수 없습니다. 최대 시도 횟수 초과');
                  clearInterval(interval);
                }
              }
            }, 500);
          };
          
          // iframe이 이미 로드된 경우
          if (iframe.contentDocument.readyState === 'complete') {
            console.log('content.js: iframe이 이미 로드되었습니다.');
            iframe.onload();
          }
        } else {
          console.log('content.js: DOM이 아직 로드되지 않았습니다.');
        }
      })();
      
      // 응답 반환
      sendResponse({ received: true });
    } else {
      console.log('content.js: 저장된 메시지가 없습니다.');
      sendResponse({ received: false });
    }
  }
  
  // 응답 반환
  return true;
});

// 스크립트가 로드되었음을 알림
console.log('content.js: 스크립트가 로드되었습니다.'); 