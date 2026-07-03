import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * 웹(브라우저) 전용 HTML 셸. 네이티브 앱에는 영향 없음.
 * 아이폰 사파리 "홈 화면에 추가" 시 주소창 없이 전체화면 앱처럼 실행되도록 설정.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* 모바일 뷰포트 + 노치 안전영역(viewport-fit=cover) */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        {/* iOS: 홈 화면에 추가하면 전체화면 앱처럼 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="VibeNews" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Android/Chrome */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#FBEDE6" />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: appShellCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

// 전체화면 앱 느낌: 화면 꽉 채우고, 바운스/탭 하이라이트 제거, 테마 배경.
const appShellCss = `
html, body, #root { height: 100%; }
body { margin: 0; background-color: #FBEDE6; overscroll-behavior: none; }
@media (prefers-color-scheme: dark) { body { background-color: #1A1512; } }
* { -webkit-tap-highlight-color: transparent; }
#root { display: flex; flex-direction: column; }

/* 데스크톱(넓은 화면): 아이폰 목업 프레임 안에 앱을 보여준다. 실제 폰에선 전체화면. */
@media (min-width: 768px) {
  body {
    background: radial-gradient(120% 120% at 50% 0%, #FDF3EE 0%, #EFDBCF 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    box-sizing: border-box;
  }
  #root {
    width: 402px;
    height: min(860px, calc(100vh - 48px));
    flex: none;
    border-radius: 48px;
    overflow: hidden;
    background-color: #FBEDE6;
    border: 12px solid #0e0e10;
    box-shadow: 0 30px 80px rgba(120, 70, 40, 0.35);
    box-sizing: border-box;
  }
}
@media (min-width: 768px) and (prefers-color-scheme: dark) {
  body { background: radial-gradient(120% 120% at 50% 0%, #241A15 0%, #130F0C 100%); }
  #root { background-color: #1A1512; }
}
`;
