/**
 * 身份常量：插件 id、API 前缀、数据根目录名、UI 入口（家族口径，GPP 版）。
 * `id` 必须与 cordis.patch.yml 的 insert id 一致（gpp-main）。
 * API_PREFIX 是宿主挂载前缀；宿主里 API_BASE='/api/gpp'，页面拼 `${API_BASE}/api/bootstrap`。
 * 守卫只禁「交界处重复 /api」，不许 includes('/api') 一刀切（家族踩 4）。
 */
export const PLUGIN_ID = 'gpp-main';
export const PACKAGE_NAME = '@xyb-community/gpp-workbench';
export const API_PREFIX = 'gpp';
export const HOME_DIR = 'gpp';
export const DB_FILE = 'gpp_workbench.sqlite';
export const UI_ENTRY = 'index.html';
export const DEV_PORT = 7807;
