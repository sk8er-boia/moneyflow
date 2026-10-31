import { defineConfig } from '@apps-in-toss/web-framework/config';

// 머니플로우 가계부 — 토스 미니앱 설정. appName은 콘솔에 등록한 이름과 같아야 해요.
export default defineConfig({
  appName: 'moneytracker',
  brand: {
    primaryColor: '#3182F6',
  },
  permissions: [],
  navigationBar: {
    withTitle: false,
    transparentBackground: false,
  },
  webView: {
    bounces: false,
    pullToRefreshEnabled: false,
    overScrollMode: 'never',
    allowsBackForwardNavigationGestures: false,
  },
  webBundleDir: 'dist',
});
