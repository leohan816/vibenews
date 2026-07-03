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
        <meta name="theme-color" content="#000000" />

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
body { margin: 0; background-color: #ffffff; overscroll-behavior: none; }
@media (prefers-color-scheme: dark) { body { background-color: #000000; } }
* { -webkit-tap-highlight-color: transparent; }
#root { display: flex; flex-direction: column; }
`;
