/*
 * 应用级样式入口。
 *
 * 这里集中管理“必须在应用启动前加载”的全局资源：
 * - Windi CSS 三层原子样式；
 * - SVG 雪碧图注册。
 *
 * 后续如果接入 UnoCSS、Tailwind CSS 或全局字体，也优先放在这里，
 * 保持 main.ts 只负责启动流程，不承担资源装配细节。
 */
import 'virtual:windi-base.css'
import 'virtual:windi-components.css'
import 'virtual:windi-utilities.css'
import 'virtual:svg-icons-register'
